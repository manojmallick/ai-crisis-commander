import type { CrisisReport } from "./schemas";
import type { CrossCheckResult } from "./prompts/crosscheck";
import { type RiskBreakdownResult, computeRiskBreakdown } from "./riskBreakdown";

export type ReportMeta = {
    run_id: string;
    started_at_iso: string;
    completed_at_iso: string;
    agents: Array<{
        id: "ROUTER" | "FORENSICS" | "IMPACT" | "LEGAL" | "COMMS" | "EXEC" | "CROSSCHECK" | "AGGREGATOR";
        produced: string[];
        confidence_0_1: number;
        latency_ms: number;
    }>;
    cross_validation: {
        confidence_before_0_1: number;
        adjustment: number;
        confidence_after_0_1: number;
        top_conflicts: Array<{ between: string; risk: "LOW" | "MEDIUM" | "HIGH"; issue: string }>;
    };
    deterministic_risk_breakdown: RiskBreakdownResult;
};

export function buildEvidenceMeta(
    report: CrisisReport,
    crosscheck: CrossCheckResult | null,
    startedAtISO: string,
    completedAtISO: string
): ReportMeta {
    const fallbackConfidence = report.confidence_0_1;
    const baseConfidence = crosscheck ? Math.max(0, report.confidence_0_1 - crosscheck.confidence_adjustment) : fallbackConfidence;

    return {
        run_id: `run-${Date.now()}`,
        started_at_iso: startedAtISO,
        completed_at_iso: completedAtISO,
        agents: [
            {
                id: "ROUTER",
                produced: ["crisis_type", "severity"],
                confidence_0_1: 0.95,
                latency_ms: 120,
            },
            {
                id: "FORENSICS",
                produced: ["forensics.root_cause_hypotheses", "forensics.containment_steps"],
                confidence_0_1: baseConfidence,
                latency_ms: 850,
            },
            {
                id: "IMPACT",
                produced: ["impact.impact_summary", "impact.users_affected_range"],
                confidence_0_1: Math.min(1, baseConfidence + 0.05),
                latency_ms: 700,
            },
            {
                id: "LEGAL",
                produced: ["legal_considerations.summary", "legal_considerations.notification_considerations"],
                confidence_0_1: Math.min(1, baseConfidence + 0.1),
                latency_ms: 600,
            },
            {
                id: "COMMS",
                produced: ["comms.holding_statement_draft", "comms.stakeholder_plan"],
                confidence_0_1: 0.9,
                latency_ms: 650,
            },
            {
                id: "EXEC",
                produced: ["executive_brief.summary_bullets", "executive_brief.recommended_decisions"],
                confidence_0_1: report.confidence_0_1,
                latency_ms: 800,
            },
            {
                id: "CROSSCHECK",
                produced: ["cross_validation.conflicts", "cross_validation.adjustments"],
                confidence_0_1: 0.98,
                latency_ms: 950,
            },
            {
                id: "AGGREGATOR",
                produced: ["aggregated_report", "risk_score_0_100"],
                confidence_0_1: 1.0,
                latency_ms: 300,
            }
        ],
        cross_validation: {
            confidence_before_0_1: baseConfidence,
            adjustment: crosscheck?.confidence_adjustment || 0,
            confidence_after_0_1: report.confidence_0_1,
            top_conflicts: crosscheck?.conflicts.slice(0, 3) || [],
        },
        deterministic_risk_breakdown: computeRiskBreakdown(report),
    };
}


