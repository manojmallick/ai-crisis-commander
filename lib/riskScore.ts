import type { RouterOutput, ImpactOutput, ForensicsOutput } from "./schemas";

export function computeRiskScore(
    router: RouterOutput,
    impact: ImpactOutput,
    forensics: ForensicsOutput
): number {
    let score = 20;

    // Severity contribution
    const sev = router.severity;
    if (sev === "MEDIUM") score += 15;
    if (sev === "HIGH") score += 30;
    if (sev === "CRITICAL") score += 45;

    // User count contribution
    const users =
        router.key_facts?.estimated_users_impacted?.toLowerCase() ?? "";
    if (users.includes("50,000") || users.includes("50000")) score += 10;
    if (users.includes("million")) score += 20;

    // High-likelihood root causes increase score
    const highLikely = (forensics.root_cause_hypotheses ?? []).some(
        (h) => h.likelihood === "HIGH"
    );
    if (highLikely) score += 10;

    // Crisis type contribution
    if (router.crisis_type === "DATA_BREACH") score += 10;
    if (router.crisis_type === "OUTAGE") score += 8;
    if (router.crisis_type === "PR_CRISIS") score += 6;

    // Financial risk band
    if (impact.financial_risk_band === "HIGH") score += 5;

    // Clamp 0..100
    return Math.max(0, Math.min(100, score));
}

export function computeConfidence(router: RouterOutput): number {
    const missing = router.missing_information?.length ?? 0;
    const base = 0.85;
    const penalty = Math.min(0.5, missing * 0.05);
    return Math.round(Math.max(0.2, base - penalty) * 100) / 100;
}
