import type { CrisisReport } from "./schemas";

export function simulateDelay(report: CrisisReport, minutes: number = 30): CrisisReport {
    // Clone report to avoid mutating original
    const sim: CrisisReport = JSON.parse(JSON.stringify(report));

    // Increase risk
    let riskBump = 0;
    if (sim.severity === "CRITICAL" || sim.severity === "HIGH") {
        riskBump += 8;
    } else {
        riskBump += 5;
    }

    const hasOngoing = sim.forensics.containment_steps.some(s =>
        s.toLowerCase().includes("ongoing") || s.toLowerCase().includes("active")
    );
    if (hasOngoing) {
        riskBump += 10;
    }

    sim.risk_score_0_100 = Math.min(100, sim.risk_score_0_100 + riskBump);

    // Decrease confidence
    sim.confidence_0_1 = Math.max(0.2, sim.confidence_0_1 - 0.07);

    // Worsen financial risk
    if (sim.risk_score_0_100 > 85 && sim.impact.financial_risk_band === "MEDIUM") {
        sim.impact.financial_risk_band = "HIGH";
    } else if (sim.risk_score_0_100 > 70 && sim.impact.financial_risk_band === "LOW") {
        sim.impact.financial_risk_band = "MEDIUM";
    }

    // We don't modify the exact heatmap cells here because the heatmap component 
    // computes its own matrix from the core state or uses deterministic mapping.
    // However, if there are fields that heatmap relies on, we update them.
    // Let's ensure severity is bumped if risk is crazy
    if (sim.risk_score_0_100 >= 90 && sim.severity !== "CRITICAL") {
        sim.severity = "CRITICAL";
    }

    // Add a simulated log to actions
    sim.action_plan.next_60_minutes.unshift(`[SIMULATED +${minutes}m] Threat actor presence potentially expanded during delay.`);

    return sim;
}
