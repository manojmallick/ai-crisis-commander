"use client";

import type { CrossCheckResult } from "@/lib/prompts/crosscheck";
import type { CrisisReport } from "@/lib/schemas";
import { buildDebateLog } from "@/lib/debate";

interface CrosscheckPanelProps {
    crosscheck: CrossCheckResult | null;
    report?: CrisisReport | null;
}

function RiskBadge({ risk }: { risk: string }) {
    const cls =
        risk === "HIGH"
            ? "severity-high"
            : risk === "MEDIUM"
                ? "severity-medium"
                : "severity-low";
    return <span className={`severity-badge text-xs ${cls}`}>{risk}</span>;
}

export default function CrosscheckPanel({ crosscheck, report }: CrosscheckPanelProps) {
    if (!crosscheck && !report) {
        return (
            <div className="glass-panel p-5 fade-in">
                <div className="section-header">
                    <div className="section-icon">🔀</div>
                    <h2>Cross-Validation</h2>
                </div>
                <p className="text-xs text-war-muted italic text-center py-4">
                    Cross-check unavailable
                </p>
            </div>
        );
    }

    const adjPct = crosscheck ? Math.round(crosscheck.confidence_adjustment * 100) : 0;
    const adjColor =
        (crosscheck?.confidence_adjustment ?? 0) < -0.1
            ? "text-red-400"
            : (crosscheck?.confidence_adjustment ?? 0) < 0
                ? "text-amber-400"
                : "text-green-400";

    return (
        <div className="glass-panel p-5 fade-in max-h-[500px] overflow-y-auto">
            <div className="section-header">
                <div className="section-icon">🔀</div>
                <h2>Cross-Validation</h2>
            </div>

            {/* Confidence Adjustment */}
            {crosscheck && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-black/20 border border-war-border">
                    <span className="text-xs text-war-text-dim">Confidence adjustment:</span>
                    <span className={`text-sm font-bold font-mono ${adjColor}`}>
                        {adjPct > 0 ? `+${adjPct}` : adjPct}%
                    </span>
                </div>
            )}

            {/* Agent Debate Log */}
            {report && (
                <div className="mb-4">
                    <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                        💬 Agent Debate Log
                    </h4>
                    <div className="space-y-1 p-3 rounded-xl bg-black/20 border border-war-border">
                        {buildDebateLog(report, crosscheck).map((line, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <span className="text-[10px] font-mono font-bold text-war-accent uppercase w-20 shrink-0">
                                    {line.agent}:
                                </span>
                                <span className="text-xs text-war-text leading-tight sm:leading-normal">
                                    {line.stance}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Conflicts */}
            {crosscheck && crosscheck.conflicts.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                        ⚡ Agent Conflicts
                    </h4>
                    <div className="space-y-2">
                        {crosscheck.conflicts.map((c, i) => (
                            <div
                                key={i}
                                className="p-3 rounded-xl bg-black/20 border border-war-border"
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs font-semibold text-war-accent font-mono">
                                        {c.between}
                                    </span>
                                    <RiskBadge risk={c.risk} />
                                </div>
                                <p className="text-xs text-war-text mb-1">{c.issue}</p>
                                <p className="text-[10px] text-war-text-dim">
                                    💡 Fix: {c.fix}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Overconfident Claims */}
            {crosscheck && crosscheck.overconfident_claims.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                        ⚠️ Overconfident Claims
                    </h4>
                    <ul className="space-y-1">
                        {crosscheck.overconfident_claims.map((claim, i) => (
                            <li
                                key={i}
                                className="text-xs text-amber-300 pl-3 relative before:content-['!'] before:absolute before:left-0 before:text-amber-500 before:font-bold"
                            >
                                {claim}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Missing Evidence */}
            {crosscheck && crosscheck.missing_evidence_flags.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                        🔍 Missing Evidence
                    </h4>
                    <ul className="space-y-1">
                        {crosscheck.missing_evidence_flags.map((flag, i) => (
                            <li
                                key={i}
                                className="text-xs text-war-text pl-3 relative before:content-['?'] before:absolute before:left-0 before:text-blue-400 before:font-bold"
                            >
                                {flag}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommended Edits */}
            {crosscheck && crosscheck.recommended_edits.length > 0 && (
                <div>
                    <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                        ✏️ Recommended Edits
                    </h4>
                    <div className="space-y-1.5">
                        {crosscheck.recommended_edits.map((edit, i) => (
                            <div
                                key={i}
                                className="text-xs text-war-text p-2 rounded-lg bg-black/20 border border-war-border"
                            >
                                <span className="text-[10px] font-mono text-war-accent uppercase">
                                    {edit.target}
                                </span>
                                <p className="mt-0.5">{edit.edit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
