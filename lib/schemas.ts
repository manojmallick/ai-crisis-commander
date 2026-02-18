import { z } from "zod";

// ─── Router Schema ───────────────────────────────────────────────
export const RouterSchema = z.object({
    crisis_type: z.enum(["DATA_BREACH", "OUTAGE", "PR_CRISIS", "FRAUD", "OTHER"]),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    time_horizon: z.enum(["NEXT_60_MIN", "NEXT_24_HOURS", "NEXT_7_DAYS"]),
    key_facts: z.object({
        what_happened: z.string(),
        systems_affected: z.array(z.string()),
        regions_affected: z.array(z.string()),
        estimated_users_impacted: z.string(),
        data_types_involved: z.array(z.string()),
        current_status: z.string(),
    }),
    assumptions: z.array(z.string()),
    missing_information: z.array(z.string()),
    agent_plan: z.array(
        z.object({
            agent: z.enum(["FORENSICS", "IMPACT", "LEGAL", "PR", "EXEC"]),
            priority: z.number().int(),
            why: z.string(),
        })
    ),
});

export type RouterOutput = z.infer<typeof RouterSchema>;

// ─── Forensics Agent Schema ──────────────────────────────────────
export const AgentForensicsSchema = z.object({
    root_cause_hypotheses: z.array(
        z.object({
            hypothesis: z.string(),
            likelihood: z.enum(["LOW", "MEDIUM", "HIGH"]),
            supporting_signals: z.array(z.string()),
            disconfirming_signals: z.array(z.string()),
        })
    ),
    immediate_containment_steps: z.array(z.string()),
    timeline_hypothesis: z.array(
        z.object({
            t: z.string(),
            event: z.string(),
        })
    ),
    high_value_questions: z.array(z.string()),
    assumptions: z.array(z.string()),
});

export type ForensicsOutput = z.infer<typeof AgentForensicsSchema>;

// ─── Impact Estimator Schema ─────────────────────────────────────
export const AgentImpactSchema = z.object({
    impact_summary: z.string(),
    estimated_blast_radius: z.object({
        users_affected_range: z.string(),
        records_affected_range: z.string(),
        services_affected: z.array(z.string()),
        downtime_estimate: z.string(),
    }),
    financial_risk_band: z.enum(["LOW", "MEDIUM", "HIGH"]),
    operational_risks: z.array(z.string()),
    customer_risks: z.array(z.string()),
    assumptions: z.array(z.string()),
    missing_information: z.array(z.string()),
});

export type ImpactOutput = z.infer<typeof AgentImpactSchema>;

// ─── Legal Risk Agent Schema ─────────────────────────────────────
export const AgentLegalSchema = z.object({
    legal_risk_summary: z.string(),
    notification_considerations: z.array(
        z.object({
            who: z.string(),
            when: z.string(),
            why: z.string(),
        })
    ),
    liability_hotspots: z.array(z.string()),
    do_now: z.array(z.string()),
    avoid: z.array(z.string()),
    assumptions: z.array(z.string()),
    missing_information: z.array(z.string()),
    disclaimer: z.string(),
});

export type LegalOutput = z.infer<typeof AgentLegalSchema>;

// ─── PR Strategy Agent Schema ────────────────────────────────────
export const AgentPRSchema = z.object({
    comms_objectives: z.array(z.string()),
    stakeholder_plan: z.array(
        z.object({
            audience: z.enum([
                "CUSTOMERS",
                "EMPLOYEES",
                "REGULATORS",
                "PRESS",
                "PARTNERS",
                "INVESTORS",
                "PUBLIC",
            ]),
            message_theme: z.string(),
            channel: z.string(),
            timing: z.string(),
        })
    ),
    holding_statement_draft: z.string(),
    q_and_a_preparation: z.array(z.string()),
    tone_guidance: z.array(z.string()),
    assumptions: z.array(z.string()),
});

export type PROutput = z.infer<typeof AgentPRSchema>;

// ─── Executive Brief Agent Schema ────────────────────────────────
export const AgentExecSchema = z.object({
    executive_summary_bullets: z.tuple([
        z.string(),
        z.string(),
        z.string(),
        z.string(),
        z.string(),
    ]),
    recommended_decisions: z.array(
        z.object({
            decision: z.string(),
            options: z.array(z.string()),
            recommendation: z.string(),
            why: z.string(),
        })
    ),
    top_risks: z.array(z.string()),
    next_update_time_recommendation: z.string(),
    assumptions: z.array(z.string()),
});

export type ExecOutput = z.infer<typeof AgentExecSchema>;

// ─── Crisis Report (Aggregated) Schema ───────────────────────────
export const CrisisReportSchema = z.object({
    crisis_report_version: z.string(),
    crisis_type: z.enum(["DATA_BREACH", "OUTAGE", "PR_CRISIS", "FRAUD", "OTHER"]),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    risk_score_0_100: z.number().int().min(0).max(100),
    confidence_0_1: z.number().min(0).max(1),
    one_paragraph_summary: z.string(),
    action_plan: z.object({
        next_60_minutes: z.array(z.string()),
        next_24_hours: z.array(z.string()),
        next_7_days: z.array(z.string()),
    }),
    forensics: z.object({
        root_cause_hypotheses: z.array(
            z.object({
                hypothesis: z.string(),
                likelihood: z.enum(["LOW", "MEDIUM", "HIGH"]),
            })
        ),
        containment_steps: z.array(z.string()),
    }),
    impact: z.object({
        impact_summary: z.string(),
        users_affected_range: z.string(),
        financial_risk_band: z.enum(["LOW", "MEDIUM", "HIGH"]),
    }),
    legal_considerations: z.object({
        summary: z.string(),
        notification_considerations: z.array(
            z.object({
                who: z.string(),
                when: z.string(),
            })
        ),
        disclaimer: z.string(),
    }),
    comms: z.object({
        holding_statement_draft: z.string(),
        stakeholder_plan: z.array(
            z.object({
                audience: z.string(),
                channel: z.string(),
                timing: z.string(),
            })
        ),
    }),
    executive_brief: z.object({
        summary_bullets: z.tuple([
            z.string(),
            z.string(),
            z.string(),
            z.string(),
            z.string(),
        ]),
        recommended_decisions: z.array(z.string()),
    }),
    assumptions: z.array(z.string()),
    missing_information: z.array(z.string()),
});

export type CrisisReport = z.infer<typeof CrisisReportSchema>;
