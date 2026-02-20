"use client";

import { useEffect, useState } from "react";
import type { CrisisReport } from "@/lib/schemas";
import { computeRiskBreakdown, formatScoringProfile } from "@/lib/riskBreakdown";

export default function BoardBriefPage() {
    const [report, setReport] = useState<CrisisReport | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("crisis-report");
            if (stored) {
                setReport(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
    }, []);

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">No Report Loaded</h1>
                    <p className="text-gray-500">Run a crisis analysis first, then click &quot;Board Brief&quot;.</p>
                    <a href="/" className="text-blue-600 underline mt-4 block">← Back to War Room</a>
                </div>
            </div>
        );
    }

    const confPct = Math.round(report.confidence_0_1 * 100);
    const now = new Date().toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
    });

    const breakdown = computeRiskBreakdown(report);
    const riskScore = breakdown.finalScore;
    const rawSum = breakdown.rawSum;
    const profileBadgeText = formatScoringProfile(breakdown.profile);

    return (
        <div className="board-brief">
            {/* Print Button (hidden on print) */}
            <div className="no-print" style={{ padding: "16px 32px", display: "flex", gap: 12 }}>
                <button
                    onClick={() => window.print()}
                    style={{
                        padding: "8px 20px",
                        background: "#1a1a2e",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    🖨️ Print / Save PDF
                </button>
                <a
                    href="/"
                    style={{
                        padding: "8px 20px",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        color: "#333",
                        textDecoration: "none",
                        fontWeight: 500,
                    }}
                >
                    ← Back
                </a>
            </div>

            {/* Header */}
            <div className="brief-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
                            🚨 Crisis Report — Board Brief
                        </h1>
                        <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                            {now} · {report.crisis_type.replace(/_/g, " ")} · v{report.crisis_report_version}
                        </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 14,
                            background: report.severity === "CRITICAL" ? "#fee2e2" : report.severity === "HIGH" ? "#fff7ed" : "#fefce8",
                            color: report.severity === "CRITICAL" ? "#b91c1c" : report.severity === "HIGH" ? "#c2410c" : "#a16207",
                        }}>
                            {report.severity}
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="brief-metrics">
                <div className="metric-box">
                    <div className="metric-label">Risk Score</div>
                    <div className="metric-value" style={{ color: riskScore >= 70 ? "#dc2626" : "#f59e0b" }}>
                        {riskScore}/100
                    </div>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
                        Raw Sum: {rawSum} {rawSum > 100 && <span style={{ opacity: 0.7 }}>(capped at 100)</span>}
                    </div>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
                        {profileBadgeText}
                    </div>
                </div>
                <div className="metric-box">
                    <div className="metric-label">Confidence</div>
                    <div className="metric-value" style={{ color: "#2563eb" }}>{confPct}%</div>
                </div>
                <div className="metric-box">
                    <div className="metric-label">Users Affected</div>
                    <div className="metric-value" style={{ fontSize: 16 }}>{report.impact.users_affected_range}</div>
                </div>
                <div className="metric-box">
                    <div className="metric-label">Financial Risk</div>
                    <div className="metric-value" style={{
                        color: report.impact.financial_risk_band === "HIGH" ? "#dc2626" : "#f59e0b",
                    }}>
                        {report.impact.financial_risk_band}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="brief-section">
                <h2>Incident Summary</h2>
                <p>{report.one_paragraph_summary}</p>
            </div>

            {/* Executive Summary */}
            <div className="brief-section">
                <h2>Executive Summary</h2>
                <ol>
                    {report.executive_brief.summary_bullets.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                    ))}
                </ol>
            </div>

            {/* Action Plan */}
            <div className="brief-section">
                <h2>Action Plan</h2>
                <div className="brief-columns">
                    <div>
                        <h3>🔴 Next 60 Minutes</h3>
                        <ul>
                            {report.action_plan.next_60_minutes.map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3>🟡 Next 24 Hours</h3>
                        <ul>
                            {report.action_plan.next_24_hours.map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3>🟢 Next 7 Days</h3>
                        <ul>
                            {report.action_plan.next_7_days.map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* PR Statement */}
            <div className="brief-section">
                <h2>Holding Statement (Draft)</h2>
                <blockquote>&ldquo;{report.comms.holding_statement_draft}&rdquo;</blockquote>
            </div>

            {/* Legal */}
            <div className="brief-section">
                <h2>Legal Considerations</h2>
                <p>{report.legal_considerations.summary}</p>
                {report.legal_considerations.notification_considerations.length > 0 && (
                    <table className="brief-table">
                        <thead>
                            <tr>
                                <th>Who</th>
                                <th>When</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.legal_considerations.notification_considerations.map((n: { who: string, when: string }, i: number) => (
                                <tr key={i}>
                                    <td>{n.who}</td>
                                    <td>{n.when}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <p className="disclaimer">⚠️ {report.legal_considerations.disclaimer}</p>
            </div>

            {/* Decisions */}
            <div className="brief-section">
                <h2>Recommended Decisions</h2>
                <ul>
                    {report.executive_brief.recommended_decisions.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                    ))}
                </ul>
            </div>

            {/* Assumptions */}
            {report.assumptions.length > 0 && (
                <div className="brief-section">
                    <h2>Assumptions & Gaps</h2>
                    <div className="brief-columns" style={{ gridTemplateColumns: "1fr 1fr" }}>
                        <div>
                            <h3>Assumptions</h3>
                            <ul>
                                {report.assumptions.map((a: string, i: number) => (
                                    <li key={i}>{a}</li>
                                ))}
                            </ul>
                        </div>
                        {report.missing_information.length > 0 && (
                            <div>
                                <h3>Missing Information</h3>
                                <ul>
                                    {report.missing_information.map((m: string, i: number) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="brief-footer">
                <p>AI Crisis Commander — Board Brief · Generated {now}</p>
                <p>This document is for informational purposes only. Not legal advice.</p>
            </div>
        </div>
    );
}
