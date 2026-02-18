"use client";

import type { CrisisReport } from "@/lib/schemas";

interface EscalationBadgeProps {
    report: CrisisReport;
}

function computeEscalation(report: CrisisReport): {
    level: string;
    label: string;
    color: string;
    bgColor: string;
    glow: string;
} {
    const risk = report.risk_score_0_100;
    const sev = report.severity;

    if (sev === "CRITICAL" || risk >= 85) {
        return {
            level: "SEV-0",
            label: "Board Attention Required",
            color: "#fca5a5",
            bgColor: "rgba(239, 68, 68, 0.15)",
            glow: "0 0 12px rgba(239, 68, 68, 0.4)",
        };
    }
    if (sev === "HIGH" || risk >= 70) {
        return {
            level: "SEV-1",
            label: "VP / C-Suite Escalation",
            color: "#fbbf24",
            bgColor: "rgba(245, 158, 11, 0.15)",
            glow: "0 0 8px rgba(245, 158, 11, 0.3)",
        };
    }
    if (sev === "MEDIUM" || risk >= 40) {
        return {
            level: "SEV-2",
            label: "Director-Level Response",
            color: "#93c5fd",
            bgColor: "rgba(59, 130, 246, 0.12)",
            glow: "none",
        };
    }
    return {
        level: "SEV-3",
        label: "Team Lead Awareness",
        color: "#86efac",
        bgColor: "rgba(34, 197, 94, 0.12)",
        glow: "none",
    };
}

export default function EscalationBadge({ report }: EscalationBadgeProps) {
    const esc = computeEscalation(report);

    return (
        <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all fade-in"
            style={{
                background: esc.bgColor,
                borderColor: `${esc.color}40`,
                boxShadow: esc.glow,
            }}
        >
            <span
                className="text-xs font-mono font-black tracking-wider"
                style={{ color: esc.color }}
            >
                {esc.level}
            </span>
            <div className="w-px h-4 bg-war-border" />
            <span className="text-xs font-semibold" style={{ color: esc.color }}>
                Escalation: {esc.label}
            </span>
        </div>
    );
}
