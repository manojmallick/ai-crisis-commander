import type { CrisisReport } from "./schemas";

/* ────────── Types ────────── */

export type HeatLevel = 0 | 1 | 2 | 3;

export interface HeatCell {
    score: HeatLevel;
    label: string;
}

export interface HeatmapRow {
    category: string;
    icon: string;
    cells: [HeatCell, HeatCell, HeatCell]; // 60m, 24h, 7d
}

export const TIME_HORIZONS = ["60 min", "24 hours", "7 days"] as const;
export const HEAT_COLORS: Record<HeatLevel, string> = {
    0: "bg-green-500/30 text-green-300 border-green-500/30",
    1: "bg-yellow-500/30 text-yellow-300 border-yellow-500/30",
    2: "bg-orange-500/30 text-orange-300 border-orange-500/30",
    3: "bg-red-500/30 text-red-200 border-red-500/30",
};
export const HEAT_LABELS: Record<HeatLevel, string> = {
    0: "Low",
    1: "Medium",
    2: "High",
    3: "Critical",
};

/* ────────── Scoring Model ────────── */

function severityBase(severity: string): number {
    switch (severity) {
        case "CRITICAL":
            return 3;
        case "HIGH":
            return 2;
        case "MEDIUM":
            return 1;
        default:
            return 0;
    }
}

function clampHeat(n: number): HeatLevel {
    return Math.max(0, Math.min(3, Math.round(n))) as HeatLevel;
}

/** Decay score for longer time horizons (things improve over time) */
function decay(base: number, horizon: 0 | 1 | 2): number {
    const decayFactors = [0, 0.5, 1.0]; // 60m = no decay, 24h = slight, 7d = more
    return base - decayFactors[horizon];
}

export function computeHeatmap(report: CrisisReport): HeatmapRow[] {
    const base = severityBase(report.severity);
    const crisisType = report.crisis_type;
    const financialHigh = report.impact.financial_risk_band === "HIGH";
    const hasHighLikelihood = report.forensics.root_cause_hypotheses.some(
        (h) => h.likelihood === "HIGH"
    );
    const manyMissing = report.missing_information.length >= 3;
    const highConfidence = report.confidence_0_1 > 0.8;

    function score(
        category: string,
        horizon: 0 | 1 | 2
    ): HeatLevel {
        let s = decay(base, horizon);

        // Crisis-type modifiers
        if (
            (crisisType === "DATA_BREACH" || crisisType === "FRAUD") &&
            (category === "Security" || category === "Legal")
        ) {
            s += 1;
        }
        if (crisisType === "PR_CRISIS" && (category === "PR" || category === "Customer")) {
            s += 1;
        }
        if (crisisType === "OUTAGE" && category === "Operational") {
            s += 1;
        }

        // Cross-cutting modifiers
        if (financialHigh && (category === "Operational" || category === "Customer")) {
            s += 0.5;
        }
        if (hasHighLikelihood && category === "Security") {
            s += 0.5;
        }
        if (manyMissing && horizon === 0) {
            s += 0.5; // Uncertainty raises short-term risk
        }
        if (highConfidence) {
            s -= 0.5; // High confidence lowers perceived risk
        }

        return clampHeat(s);
    }

    function cellLabel(category: string, horizon: 0 | 1 | 2): string {
        const s = score(category, horizon);
        if (s === 0) return "Stable";
        if (horizon === 0) {
            // 60 min specifics
            if (category === "Security") return s >= 2 ? "Active threat" : "Monitoring";
            if (category === "Legal") return s >= 2 ? "Notification req" : "Review needed";
            if (category === "PR") return s >= 2 ? "Statement needed" : "Draft ready";
            if (category === "Operational") return s >= 2 ? "Degraded" : "Impacted";
            if (category === "Customer") return s >= 2 ? "Customers notified" : "Assessing";
        }
        if (horizon === 1) {
            if (category === "Security") return s >= 2 ? "Remediation" : "Patching";
            if (category === "Legal") return s >= 2 ? "Filings due" : "Under review";
            if (category === "PR") return s >= 2 ? "Media response" : "Monitoring";
            if (category === "Operational") return s >= 2 ? "Recovery" : "Restoring";
            if (category === "Customer") return s >= 2 ? "Outreach" : "Support ramp";
        }
        // 7 days
        if (category === "Security") return s >= 2 ? "Full audit" : "Post-mortem";
        if (category === "Legal") return s >= 2 ? "Regulatory" : "Compliance";
        if (category === "PR") return s >= 2 ? "Brand repair" : "Positive PR";
        if (category === "Operational") return s >= 2 ? "Hardening" : "Improvements";
        if (category === "Customer") return s >= 2 ? "Retention" : "Follow-up";
        return HEAT_LABELS[s];
    }

    const categories = [
        { name: "Security", icon: "🔒" },
        { name: "Legal", icon: "⚖️" },
        { name: "PR", icon: "📢" },
        { name: "Operational", icon: "⚙️" },
        { name: "Customer", icon: "👥" },
    ];

    return categories.map(({ name, icon }) => ({
        category: name,
        icon,
        cells: [0, 1, 2].map((h) => ({
            score: score(name, h as 0 | 1 | 2),
            label: cellLabel(name, h as 0 | 1 | 2),
        })) as [HeatCell, HeatCell, HeatCell],
    }));
}
