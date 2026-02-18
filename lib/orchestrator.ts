import { callYouJSON } from "./youClient";
import { routerPrompt } from "./prompts/router";
import { aggregatorPrompt } from "./prompts/aggregator";
import {
    RouterSchema,
    AgentForensicsSchema,
    AgentImpactSchema,
    AgentLegalSchema,
    AgentPRSchema,
    AgentExecSchema,
    CrisisReportSchema,
} from "./schemas";
import type {
    RouterOutput,
    ForensicsOutput,
    ImpactOutput,
    LegalOutput,
    PROutput,
    ExecOutput,
    CrisisReport,
} from "./schemas";
import { computeRiskScore, computeConfidence } from "./riskScore";
import {
    forensicsPrompt,
    impactPrompt,
    legalPrompt,
    prPrompt,
    execPrompt,
} from "./prompts/agents";
import { crosscheckPrompt, CrossCheckSchema } from "./prompts/crosscheck";
import type { CrossCheckResult } from "./prompts/crosscheck";

const SYSTEM_JSON = `
You are an expert crisis response assistant inside an incident war room.
You must output ONLY valid JSON that matches the provided schema.
No markdown. No extra keys. No commentary outside JSON.
If information is missing, state assumptions and add items to missing_information.
Be conservative and safety-first.
`.trim();

export type AgentName = "FORENSICS" | "IMPACT" | "LEGAL" | "PR" | "EXEC";

export interface CrisisWarRoomResult {
    router: RouterOutput;
    forensics: ForensicsOutput;
    impact: ImpactOutput;
    legal: LegalOutput;
    pr: PROutput;
    exec: ExecOutput;
    report: CrisisReport;
    crosscheck: CrossCheckResult | null;
}

export type AgentStatusCallback = (
    agent: AgentName | "ROUTER" | "AGGREGATOR" | "CROSSCHECK",
    status: "running" | "done" | "error",
    result?: unknown
) => void;

export async function runCrisisWarRoom(
    input: { transcript: string; evidence?: string },
    onStatus?: AgentStatusCallback
): Promise<CrisisWarRoomResult> {
    // 1) Router — classify the crisis
    onStatus?.("ROUTER", "running");
    const routerRaw = await callYouJSON({
        system: SYSTEM_JSON,
        prompt: routerPrompt(input.transcript, input.evidence),
        temperature: 0.2,
    });
    const router = RouterSchema.parse(routerRaw);
    onStatus?.("ROUTER", "done", router);

    // Build shared context for agents
    const ctx = {
        crisis_type: router.crisis_type,
        severity: router.severity,
        key_facts: router.key_facts as Record<string, unknown>,
        transcript: input.transcript,
        evidence: input.evidence ?? "",
    };

    // 2) Run 5 agents in parallel
    const agentNames: AgentName[] = ["FORENSICS", "IMPACT", "LEGAL", "PR", "EXEC"];
    agentNames.forEach((name) => onStatus?.(name, "running"));

    const makeAgentCall = async <T>(
        name: AgentName,
        promptFn: (c: typeof ctx) => string,
        schema: { parse: (d: unknown) => T },
        temp = 0.2
    ): Promise<T> => {
        try {
            const raw = await callYouJSON({
                system: SYSTEM_JSON,
                prompt: promptFn(ctx),
                temperature: temp,
            });
            const parsed = schema.parse(raw);
            onStatus?.(name, "done", parsed);
            return parsed;
        } catch (err) {
            onStatus?.(name, "error");
            throw err;
        }
    };

    const [forensics, impact, legal, pr, exec] = await Promise.all([
        makeAgentCall("FORENSICS", forensicsPrompt, AgentForensicsSchema),
        makeAgentCall("IMPACT", impactPrompt, AgentImpactSchema),
        makeAgentCall("LEGAL", legalPrompt, AgentLegalSchema),
        makeAgentCall("PR", prPrompt, AgentPRSchema, 0.3),
        makeAgentCall("EXEC", execPrompt, AgentExecSchema),
    ]);

    // 3) Cross-validation — single pass (safe: skip on failure)
    let crosscheck: CrossCheckResult | null = null;
    try {
        onStatus?.("CROSSCHECK", "running");
        const ccRaw = await callYouJSON({
            system: SYSTEM_JSON,
            prompt: crosscheckPrompt({ forensics, impact, legal, pr, exec }),
            temperature: 0.3,
        });
        crosscheck = CrossCheckSchema.parse(ccRaw);
        onStatus?.("CROSSCHECK", "done", crosscheck);
    } catch {
        // Cross-check is optional — silently skip
        onStatus?.("CROSSCHECK", "error");
    }

    // 4) Aggregator — merge into single Crisis Report
    onStatus?.("AGGREGATOR", "running");
    const aggRaw = await callYouJSON({
        system: SYSTEM_JSON,
        prompt: aggregatorPrompt({ router, forensics, impact, legal, pr, exec }),
        temperature: 0.1,
    });

    let report = CrisisReportSchema.parse(aggRaw);
    onStatus?.("AGGREGATOR", "done");

    // 5) Override with deterministic risk & confidence scores
    const risk = computeRiskScore(router, impact, forensics);
    let confidence = computeConfidence(router);

    // Apply cross-check confidence adjustment (clamped 0–1)
    if (crosscheck) {
        confidence = Math.max(0, Math.min(1, confidence + crosscheck.confidence_adjustment));
    }

    report = {
        ...report,
        risk_score_0_100: risk,
        confidence_0_1: confidence,
    };

    return { router, forensics, impact, legal, pr, exec, report, crosscheck };
}
