import type { CrisisReport } from "./schemas";

export type RiskPointItem = {
    label: string;
    points: number;
    reason: string;
};

export type ScoringProfile = "EXECUTIVE" | "FORENSICS_EXPANDED";

export function formatScoringProfile(profile: ScoringProfile): string {
    switch (profile) {
        case "FORENSICS_EXPANDED":
            return "Scoring Profile: Forensics (Expanded Factors)";
        case "EXECUTIVE":
            return "Scoring Profile: Executive (Core Factors)";
        default:
            return "Scoring Profile";
    }
}

export type RiskBreakdownResult = {
    finalScore: number;
    rawSum: number;
    items: RiskPointItem[];
    profile: ScoringProfile;
};

export function computeRiskBreakdown(report: CrisisReport, profile: ScoringProfile = "FORENSICS_EXPANDED"): RiskBreakdownResult {
    const items: RiskPointItem[] = [];
    let sum = 0;

    const addPoint = (label: string, points: number, reason: string) => {
        items.push({ label, points, reason });
        sum += points;
    };

    // Base Severity
    if (report.severity === "CRITICAL") addPoint("Base Severity", 60, "Derived from CRITICAL severity classification (risk band mapping)");
    else if (report.severity === "HIGH") addPoint("Base Severity", 40, "Derived from HIGH severity classification (risk band mapping)");
    else if (report.severity === "MEDIUM") addPoint("Base Severity", 20, "Derived from MEDIUM severity classification (risk band mapping)");
    else if (report.severity === "LOW") addPoint("Base Severity", 10, "Derived from LOW severity classification (risk band mapping)");

    // Users affected
    const usersStr = report.impact.users_affected_range.toLowerCase();
    if (usersStr.includes(">50k") || usersStr.includes("+50k") || usersStr.includes("> 50,000") || usersStr.includes("global") || usersStr.includes("millions")) {
        addPoint("Users Affected", 25, "Estimated exposure: >50k users");
    } else if (usersStr.includes("10k-50k") || usersStr.includes("10,000 - 50,000") || usersStr.includes("tens of thousands")) {
        addPoint("Users Affected", 15, "Estimated exposure: 10k–50k users");
    } else if (usersStr.includes("1k-10k") || usersStr.includes("1,000") || usersStr.includes("thousands")) {
        addPoint("Users Affected", 8, "Estimated exposure: 1k–10k users");
    } else {
        addPoint("Users Affected", 15, "Estimated volume");
    }

    // Financial Exposure
    if (report.impact.financial_risk_band === "HIGH") {
        addPoint("Financial Exposure", 15, "HIGH financial risk band triggered");
    } else if (report.impact.financial_risk_band === "MEDIUM") {
        addPoint("Financial Exposure", 5, "MEDIUM financial risk band");
    }

    // Expanded Factors
    if (profile === "FORENSICS_EXPANDED") {
        // Uncertainty Penalty
        if (report.assumptions.length > 2) {
            addPoint("Uncertainty Penalty", 5, ">2 unverified assumptions");
        }

        // Intelligence Gap
        if (report.missing_information.length > 0) {
            addPoint("Intelligence Gap", 5, "Missing critical information fields");
        }
    }

    // Active Threat
    const summaryLower = report.one_paragraph_summary.toLowerCase();
    const hasOngoingFromSummary = summaryLower.includes("ongoing access") || summaryLower.includes("active ") || summaryLower.includes("ongoing");
    const hasOngoingFromContainment = report.forensics.containment_steps.some(s =>
        s.toLowerCase().includes("ongoing") || s.toLowerCase().includes("active") || s.toLowerCase().includes("isolate")
    );
    if (hasOngoingFromSummary || hasOngoingFromContainment) {
        addPoint("Active Threat", 10, "Containment requires active isolation");
    }

    // Regulatory Trigger
    const legalSummary = report.legal_considerations.summary.toLowerCase();
    const hasGDPR = legalSummary.includes("gdpr") || legalSummary.includes("ccpa") || legalSummary.includes("72h") || legalSummary.includes("72 hours");
    const hasNotifs = report.legal_considerations.notification_considerations.some(n => {
        const whoStr = n.who.toLowerCase();
        const whenStr = n.when.toLowerCase();
        return whoStr.includes("gdpr") || whoStr.includes("ccpa") || whoStr.includes("regulator") ||
            whenStr.includes("72h") || whenStr.includes("72 hours");
    });
    if (hasGDPR || hasNotifs || report.legal_considerations.notification_considerations.length > 0) {
        addPoint("Regulatory Trigger", 5, "Mandatory notifications required");
    }

    // Clamp
    const finalScore = Math.min(100, Math.max(0, sum));

    if (report && report.risk_score_0_100 !== undefined) {
        const diff = Math.abs(report.risk_score_0_100 - finalScore);
        if (diff > 2) {
            console.warn("Risk score mismatch detected. Using deterministic breakdown score.");
        }
    }

    return { finalScore, rawSum: sum, items, profile };
}
