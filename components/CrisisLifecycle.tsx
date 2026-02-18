"use client";

import type { CrisisReport } from "@/lib/schemas";

/* ────────── NIST Lifecycle Phases ────────── */

const PHASES = [
    { id: "detect", label: "Detect", icon: "🔍" },
    { id: "contain", label: "Contain", icon: "🛡️" },
    { id: "notify", label: "Notify", icon: "📣" },
    { id: "recover", label: "Recover", icon: "🔧" },
    { id: "review", label: "Review", icon: "📋" },
] as const;

type PhaseStatus = "done" | "active" | "pending";
type PhaseId = typeof PHASES[number]["id"];

function computePhase(report: CrisisReport): PhaseId {
    const { severity, crisis_type } = report;
    const risk = report.risk_score_0_100;

    // Heuristic: where are we in the lifecycle?
    // High severity = still in early phases
    if (severity === "CRITICAL" || risk >= 80) {
        return "contain"; // We've detected, now containing
    }
    if (severity === "HIGH" || risk >= 60) {
        if (crisis_type === "DATA_BREACH" || crisis_type === "FRAUD") {
            return "notify"; // Breaches need notification
        }
        return "contain";
    }
    if (severity === "MEDIUM") {
        return "recover";
    }
    return "review";
}

function getPhaseStatus(
    phaseId: PhaseId,
    activePhaseId: PhaseId
): PhaseStatus {
    const phaseOrder: PhaseId[] = PHASES.map((p) => p.id);
    const activeIdx = phaseOrder.indexOf(activePhaseId);
    const thisIdx = phaseOrder.indexOf(phaseId);

    if (thisIdx < activeIdx) return "done";
    if (thisIdx === activeIdx) return "active";
    return "pending";
}

interface CrisisLifecycleProps {
    report: CrisisReport;
}

export default function CrisisLifecycle({ report }: CrisisLifecycleProps) {
    const activePhase = computePhase(report);

    return (
        <div className="glass-panel p-4 fade-in">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-war-text-dim">
                    Incident Lifecycle
                </span>
                <span className="text-[9px] text-war-muted font-mono">(NIST SP 800-61)</span>
            </div>

            <div className="flex items-center">
                {PHASES.map((phase, i) => {
                    const status = getPhaseStatus(phase.id, activePhase);
                    return (
                        <div key={phase.id} className="flex items-center flex-1">
                            {/* Phase node */}
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-sm
                                        transition-all duration-500
                                        ${status === "done"
                                            ? "bg-green-500/20 border-2 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                                            : status === "active"
                                                ? "bg-red-500/20 border-2 border-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                                                : "bg-war-border/30 border-2 border-war-border"
                                        }
                                    `}
                                >
                                    {status === "done" ? (
                                        <span className="text-green-400 text-xs">✓</span>
                                    ) : status === "active" ? (
                                        <span className="text-xs">{phase.icon}</span>
                                    ) : (
                                        <span className="text-war-muted text-xs opacity-50">
                                            {phase.icon}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={`text-[10px] mt-1 font-semibold ${status === "done"
                                        ? "text-green-400"
                                        : status === "active"
                                            ? "text-red-400"
                                            : "text-war-muted"
                                        }`}
                                >
                                    {phase.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {i < PHASES.length - 1 && (
                                <div
                                    className={`h-0.5 flex-1 -mt-4 ${status === "done"
                                        ? "bg-green-500/40"
                                        : "bg-war-border/30"
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
