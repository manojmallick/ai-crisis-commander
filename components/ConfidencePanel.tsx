"use client";

import { useState } from "react";
import type { CrisisReport } from "@/lib/schemas";

interface ConfidencePanelProps {
    report: CrisisReport;
    riskScore: number;
}

/* ────────── Confidence Factor Calculator ────────── */

interface ConfidenceFactor {
    text: string;
    positive: boolean;
}

function computeConfidenceFactors(report: CrisisReport): ConfidenceFactor[] {
    const factors: ConfidenceFactor[] = [];

    // Positive factors
    if (report.severity) {
        factors.push({ text: "Clear severity classification", positive: true });
    }
    if (report.impact.users_affected_range && report.impact.users_affected_range !== "Unknown") {
        factors.push({ text: "Specific user count mentioned", positive: true });
    }
    if (report.forensics.root_cause_hypotheses.length > 0) {
        factors.push({ text: "Root cause hypotheses generated", positive: true });
    }
    if (report.forensics.root_cause_hypotheses.some((h) => h.likelihood === "HIGH")) {
        factors.push({ text: "High-likelihood hypothesis identified", positive: true });
    }
    if (report.action_plan.next_60_minutes.length >= 3) {
        factors.push({ text: "Concrete immediate actions defined", positive: true });
    }

    // Negative factors
    if (report.missing_information.length >= 3) {
        factors.push({ text: `${report.missing_information.length} information gaps identified`, positive: false });
    }
    if (report.assumptions.length >= 4) {
        factors.push({ text: `${report.assumptions.length} unverified assumptions`, positive: false });
    }
    if (!report.forensics.root_cause_hypotheses.some((h) => h.likelihood === "HIGH")) {
        factors.push({ text: "No confirmed root cause yet", positive: false });
    }
    if (report.impact.financial_risk_band === "HIGH") {
        factors.push({ text: "High financial exposure uncertain", positive: false });
    }
    if (report.missing_information.some((m) => m.toLowerCase().includes("log") || m.toLowerCase().includes("forensic"))) {
        factors.push({ text: "No forensic logs attached", positive: false });
    }

    return factors;
}

/* ────────── "If We're Wrong" Robustness ────────── */

function computeRobustness(report: CrisisReport): string[] {
    const items: string[] = [];

    if (report.forensics.containment_steps.length > 0) {
        items.push("Containment steps still reduce blast radius regardless of root cause");
    }
    if (report.comms.holding_statement_draft) {
        items.push("PR holding statement remains safe — uses hedging language");
    }
    if (report.legal_considerations.notification_considerations.length > 0) {
        items.push("Legal escalation pathway still appropriate even if scope differs");
    }
    if (report.action_plan.next_60_minutes.length > 0) {
        items.push("Immediate actions are defensive and reversible");
    }
    if (report.assumptions.length > 0) {
        items.push("Assumptions are explicitly labeled for rapid re-assessment");
    }

    return items.slice(0, 4);
}

export default function ConfidencePanel({ report, riskScore }: ConfidencePanelProps) {
    const confidencePct = Math.round(report.confidence_0_1 * 100);
    const [breakdownOpen, setBreakdownOpen] = useState(false);
    const factors = computeConfidenceFactors(report);
    const robustness = computeRobustness(report);

    return (
        <div className="glass-panel p-5 fade-in max-h-[500px] overflow-y-auto">
            <div className="section-header">
                <div className="section-icon">🎯</div>
                <h2>Confidence &amp; Assumptions</h2>
            </div>
            <p className="text-xs text-war-text-dim mb-5">
                This war room is conservative: it labels uncertainty and asks for
                missing facts.
            </p>

            {/* Confidence Bar */}
            <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-war-text-dim font-semibold uppercase tracking-wider">
                        Confidence
                    </span>
                    <span className="text-sm font-bold text-war-text">
                        {confidencePct}%
                    </span>
                </div>
                <div className="w-full h-2 rounded-full bg-war-border overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${confidencePct >= 70
                            ? "bg-green-500"
                            : confidencePct >= 40
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                        style={{ width: `${confidencePct}%` }}
                    />
                </div>
            </div>

            {/* Confidence Breakdown (Expandable) */}
            <button
                onClick={() => setBreakdownOpen(!breakdownOpen)}
                className="text-[10px] text-war-accent hover:text-war-accent-glow transition-colors mb-4 flex items-center gap-1"
            >
                <span className="text-[8px]">{breakdownOpen ? "▼" : "▶"}</span>
                {breakdownOpen ? "Hide" : "Show"} confidence factors
            </button>

            {breakdownOpen && (
                <div className="mb-4 p-3 rounded-xl bg-black/20 border border-war-border space-y-1.5 fade-in">
                    <p className="text-[10px] uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                        Confidence Factors
                    </p>
                    {factors.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className={`text-xs font-bold shrink-0 ${f.positive ? "text-green-400" : "text-red-400"}`}>
                                {f.positive ? "+" : "−"}
                            </span>
                            <span className="text-xs text-war-text">{f.text}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Risk Score */}
            <div className="mb-5 flex items-center justify-between p-3 rounded-xl border border-war-border bg-black/20">
                <span className="text-xs text-war-text-dim font-semibold uppercase tracking-wider">
                    Risk Score
                </span>
                <span
                    className={`text-lg font-bold ${riskScore >= 80
                        ? "text-red-400"
                        : riskScore >= 60
                            ? "text-amber-400"
                            : riskScore >= 30
                                ? "text-yellow-400"
                                : "text-green-400"
                        }`}
                >
                    {riskScore}/100
                </span>
            </div>

            {/* Assumptions */}
            <div className="mb-4">
                <h3 className="text-xs font-semibold text-war-text-dim uppercase tracking-wider mb-2">
                    ⚠️ Assumptions Made
                </h3>
                {report.assumptions && report.assumptions.length > 0 ? (
                    <ul className="space-y-1.5">
                        {report.assumptions.map((a, i) => (
                            <li
                                key={i}
                                className="text-xs text-war-text leading-relaxed flex gap-2"
                            >
                                <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                                <span>{a}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-war-muted italic">None identified</p>
                )}
            </div>

            {/* Missing Information */}
            <div className="mb-4">
                <h3 className="text-xs font-semibold text-war-text-dim uppercase tracking-wider mb-2">
                    ❓ Missing Information
                </h3>
                {report.missing_information &&
                    report.missing_information.length > 0 ? (
                    <ul className="space-y-1.5">
                        {report.missing_information.map((m, i) => (
                            <li
                                key={i}
                                className="text-xs text-war-text leading-relaxed flex gap-2"
                            >
                                <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                                <span>{m}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-war-muted italic">None identified</p>
                )}
            </div>

            {/* "If We're Wrong" — Decision Robustness */}
            {robustness.length > 0 && (
                <div className="mt-4 pt-4 border-t border-war-border">
                    <h3 className="text-xs font-semibold text-war-text-dim uppercase tracking-wider mb-2">
                        🛡️ If Primary Hypothesis Is Wrong
                    </h3>
                    <p className="text-[10px] text-war-muted mb-2">
                        These recommendations remain valid regardless of root cause:
                    </p>
                    <ul className="space-y-1.5">
                        {robustness.map((r, i) => (
                            <li
                                key={i}
                                className="text-xs text-war-text leading-relaxed flex gap-2"
                            >
                                <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                                <span>{r}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
