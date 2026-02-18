import { z } from "zod";

/* ────────── CrossCheck Schema ────────── */

export const CrossCheckConflictSchema = z.object({
    between: z.string(),
    issue: z.string(),
    risk: z.enum(["LOW", "MEDIUM", "HIGH"]),
    fix: z.string(),
});

export const CrossCheckEditSchema = z.object({
    target: z.string(),
    edit: z.string(),
});

export const CrossCheckSchema = z.object({
    conflicts: z.array(CrossCheckConflictSchema),
    overconfident_claims: z.array(z.string()),
    missing_evidence_flags: z.array(z.string()),
    recommended_edits: z.array(CrossCheckEditSchema),
    confidence_adjustment: z.number().min(-0.3).max(0.1),
});

export type CrossCheckResult = z.infer<typeof CrossCheckSchema>;

/* ────────── Prompt ────────── */

export function crosscheckPrompt(agentOutputs: {
    forensics: unknown;
    impact: unknown;
    legal: unknown;
    pr: unknown;
    exec: unknown;
}): string {
    return `You are a Cross-Validation Agent inside an AI War Room.

Your job: review the outputs of 5 specialist agents and identify CONFLICTS, overconfident statements, missing evidence, and risky phrasing.

## Agent Outputs

FORENSICS:
${JSON.stringify(agentOutputs.forensics, null, 2)}

IMPACT:
${JSON.stringify(agentOutputs.impact, null, 2)}

LEGAL:
${JSON.stringify(agentOutputs.legal, null, 2)}

PR:
${JSON.stringify(agentOutputs.pr, null, 2)}

EXEC:
${JSON.stringify(agentOutputs.exec, null, 2)}

## Your Task

1. Find contradictions or tensions between any two agents (e.g. PR says "be transparent" but Legal says "limit disclosures").
2. Flag statements that sound overconfident given the available evidence.
3. Flag important evidence that no agent asked for but should have.
4. Suggest 1–3 concrete edits to risky statements (especially PR holding statement or action plan items).
5. Suggest a confidence adjustment (-0.3 to +0.1).

Return ONLY valid JSON matching this schema:
{
  "conflicts": [{"between":"AGENT vs AGENT","issue":"string","risk":"LOW|MEDIUM|HIGH","fix":"string"}],
  "overconfident_claims": ["string"],
  "missing_evidence_flags": ["string"],
  "recommended_edits": [{"target":"holding_statement_draft|action_plan|summary","edit":"string"}],
  "confidence_adjustment": -0.05
}

Be concise. Maximum 3 conflicts, 3 overconfident claims, 3 missing evidence flags, 3 edits.`;
}
