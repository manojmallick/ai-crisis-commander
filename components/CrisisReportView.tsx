"use client";

import { useState } from "react";
import type { CrisisReport } from "@/lib/schemas";
import { downloadJson, crisisReportFilename, confidencePercent } from "@/lib/utils";

interface CrisisReportViewProps {
    report: CrisisReport;
    fullData: Record<string, unknown>;
}

type ViewMode = "FULL" | "EXEC";

type Tab =
    | "summary"
    | "action"
    | "forensics"
    | "impact"
    | "legal"
    | "comms"
    | "executive";

const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "summary", label: "Summary", icon: "📋" },
    { id: "action", label: "Action Plan", icon: "⚡" },
    { id: "forensics", label: "Forensics", icon: "🔍" },
    { id: "impact", label: "Impact", icon: "💥" },
    { id: "legal", label: "Legal", icon: "⚖️" },
    { id: "comms", label: "Comms", icon: "📢" },
    { id: "executive", label: "Executive", icon: "👔" },
];

function SeverityBadge({ severity }: { severity: string }) {
    const cls =
        severity === "CRITICAL"
            ? "severity-critical"
            : severity === "HIGH"
                ? "severity-high"
                : severity === "MEDIUM"
                    ? "severity-medium"
                    : "severity-low";
    return <span className={`severity-badge ${cls}`}>● {severity}</span>;
}

function ListSection({
    title,
    items,
}: {
    title: string;
    items: string[];
}) {
    if (!items?.length) return null;
    return (
        <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                {title}
            </h4>
            <ul className="space-y-1.5">
                {items.map((item, i) => (
                    <li
                        key={i}
                        className="text-sm text-war-text pl-4 relative before:content-['▸'] before:absolute before:left-0 before:text-war-accent before:text-xs"
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function TimelineSection({
    label,
    icon,
    items,
}: {
    label: string;
    icon: string;
    items: string[];
}) {
    if (!items?.length) return null;
    return (
        <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">{icon}</span>
                <h4 className="text-sm font-semibold text-war-text">{label}</h4>
            </div>
            <div className="space-y-0">
                {items.map((item, i) => (
                    <div key={i} className="timeline-item">
                        <p className="text-sm text-war-text">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ──────────────────────────── EXECUTIVE BRIEF VIEW ──────────────────────────── */

function ExecBriefView({ report, onBack }: { report: CrisisReport; onBack: () => void }) {
    return (
        <div className="fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Executive Brief (C-Suite Ready)
                    </h3>
                    <p className="text-xs text-war-text-dim mt-1">
                        Designed for fast decision-making during the first hour.
                    </p>
                </div>
                <button onClick={onBack} className="btn-outline text-xs" id="back-full-report-btn">
                    ← Full Report
                </button>
            </div>

            {/* Risk + Confidence summary */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-black/20 border border-war-border text-center">
                    <p className="text-xs text-war-text-dim uppercase mb-1">Risk Score</p>
                    <p className={`text-2xl font-bold ${report.risk_score_0_100 >= 80 ? "text-red-400"
                        : report.risk_score_0_100 >= 60 ? "text-amber-400"
                            : report.risk_score_0_100 >= 30 ? "text-yellow-400"
                                : "text-green-400"
                        }`}>
                        {report.risk_score_0_100}/100
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-war-border text-center">
                    <p className="text-xs text-war-text-dim uppercase mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {confidencePercent(report.confidence_0_1)}
                    </p>
                </div>
            </div>

            {/* 5-Bullet Summary */}
            <div>
                <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-3">
                    ⚡ Executive Summary
                </h4>
                <ul className="space-y-2">
                    {report.executive_brief.summary_bullets.map((bullet, i) => (
                        <li
                            key={i}
                            className="flex gap-3 p-3 rounded-xl bg-black/20 border border-war-border text-sm text-war-text"
                        >
                            <span className="text-amber-400 font-bold mt-0.5 shrink-0">
                                {i + 1}.
                            </span>
                            {bullet}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Recommended Decisions */}
            <div>
                <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-3">
                    🎯 Recommended Decisions
                </h4>
                {report.executive_brief.recommended_decisions.length > 0 ? (
                    <ul className="space-y-1.5">
                        {report.executive_brief.recommended_decisions.map((d, i) => (
                            <li
                                key={i}
                                className="text-sm text-war-text pl-4 relative before:content-['▸'] before:absolute before:left-0 before:text-amber-400 before:text-xs"
                            >
                                {d}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-war-muted italic">No decisions captured</p>
                )}
            </div>

            {/* Top Risks - from assumptions */}
            {report.assumptions && report.assumptions.length > 0 && (
                <div>
                    <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-3">
                        ⚠️ Top Risks & Assumptions
                    </h4>
                    <ul className="space-y-1.5">
                        {report.assumptions.slice(0, 5).map((a, i) => (
                            <li
                                key={i}
                                className="text-sm text-war-text pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-red-400"
                            >
                                {a}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Decision Windows — SOC-grade time estimation */}
            <div>
                <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-3">
                    ⏱️ Estimated Decision Windows
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                        <p className="text-lg font-bold text-red-400">30m</p>
                        <p className="text-[10px] text-war-text-dim mt-1">Critical actions</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                        <p className="text-lg font-bold text-amber-400">2h</p>
                        <p className="text-[10px] text-war-text-dim mt-1">Public comms</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                        <p className="text-lg font-bold text-blue-400">72h</p>
                        <p className="text-[10px] text-war-text-dim mt-1">Regulatory assessment</p>
                    </div>
                </div>
            </div>

            {/* Severity badge at bottom */}
            <div className="pt-2 flex items-center gap-3">
                <SeverityBadge severity={report.severity} />
                <span className="text-xs text-war-muted">
                    {report.crisis_type.replace(/_/g, " ")} · v{report.crisis_report_version}
                </span>
            </div>
        </div>
    );
}

/* ──────────────────────────── MAIN COMPONENT ──────────────────────────── */

export default function CrisisReportView({
    report,
    fullData,
}: CrisisReportViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>("summary");
    const [viewMode, setViewMode] = useState<ViewMode>("FULL");

    const exportJSON = () => {
        downloadJson(crisisReportFilename(), fullData);
    };

    if (viewMode === "EXEC") {
        return (
            <div className="glass-panel fade-in overflow-hidden p-6">
                <ExecBriefView report={report} onBack={() => setViewMode("FULL")} />
            </div>
        );
    }

    return (
        <div className="glass-panel fade-in overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-0 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="section-icon">🚨</div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-war-text to-blue-400 bg-clip-text text-transparent">
                        Crisis Report
                    </h2>
                    <SeverityBadge severity={report.severity} />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode("EXEC")}
                        className="btn-outline text-xs"
                        id="exec-brief-btn"
                    >
                        👔 Executive Brief
                    </button>
                    <button onClick={exportJSON} className="btn-outline text-xs" id="export-json-btn">
                        ↓ Export JSON
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 px-6 mt-4 border-b border-war-border overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-btn whitespace-nowrap ${activeTab === tab.id ? "active" : ""
                            }`}
                    >
                        <span className="mr-1">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[300px]">
                {/* SUMMARY */}
                {activeTab === "summary" && (
                    <div className="fade-in space-y-4">
                        <div className="p-4 rounded-xl bg-black/20 border border-war-border">
                            <p className="text-sm text-war-text leading-relaxed">
                                {report.one_paragraph_summary}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-black/20 border border-war-border text-center">
                                <p className="text-xs text-war-text-dim uppercase mb-1">Type</p>
                                <p className="text-sm font-semibold font-mono text-war-accent">
                                    {report.crisis_type.replace("_", " ")}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-black/20 border border-war-border text-center">
                                <p className="text-xs text-war-text-dim uppercase mb-1">Version</p>
                                <p className="text-sm font-semibold font-mono text-war-text">
                                    {report.crisis_report_version}
                                </p>
                            </div>
                        </div>

                        <ListSection title="Assumptions" items={report.assumptions} />
                        <ListSection
                            title="Missing Information"
                            items={report.missing_information}
                        />
                    </div>
                )}

                {/* ACTION PLAN */}
                {activeTab === "action" && (
                    <div className="fade-in">
                        <TimelineSection
                            label="Next 60 Minutes"
                            icon="🔴"
                            items={report.action_plan.next_60_minutes}
                        />
                        <TimelineSection
                            label="Next 24 Hours"
                            icon="🟡"
                            items={report.action_plan.next_24_hours}
                        />
                        <TimelineSection
                            label="Next 7 Days"
                            icon="🟢"
                            items={report.action_plan.next_7_days}
                        />
                    </div>
                )}

                {/* FORENSICS */}
                {activeTab === "forensics" && (
                    <div className="fade-in space-y-4">
                        <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold">
                            Root Cause Hypotheses
                        </h4>
                        {report.forensics.root_cause_hypotheses.map((h, i) => (
                            <div
                                key={i}
                                className="p-4 rounded-xl bg-black/20 border border-war-border"
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-medium text-war-text">
                                        {h.hypothesis}
                                    </p>
                                    <span
                                        className={`severity-badge text-xs ${h.likelihood === "HIGH"
                                            ? "severity-high"
                                            : h.likelihood === "MEDIUM"
                                                ? "severity-medium"
                                                : "severity-low"
                                            }`}
                                    >
                                        {h.likelihood}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <ListSection
                            title="Containment Steps"
                            items={report.forensics.containment_steps}
                        />
                    </div>
                )}

                {/* IMPACT */}
                {activeTab === "impact" && (
                    <div className="fade-in space-y-4">
                        <div className="p-4 rounded-xl bg-black/20 border border-war-border">
                            <p className="text-sm text-war-text">
                                {report.impact.impact_summary}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-black/20 border border-war-border">
                                <p className="text-xs text-war-text-dim uppercase mb-1">
                                    Users Affected
                                </p>
                                <p className="text-sm font-semibold text-war-text">
                                    {report.impact.users_affected_range}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-black/20 border border-war-border">
                                <p className="text-xs text-war-text-dim uppercase mb-1">
                                    Financial Risk
                                </p>
                                <p
                                    className={`text-sm font-semibold ${report.impact.financial_risk_band === "HIGH"
                                        ? "text-red-400"
                                        : report.impact.financial_risk_band === "MEDIUM"
                                            ? "text-amber-400"
                                            : "text-green-400"
                                        }`}
                                >
                                    {report.impact.financial_risk_band}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* LEGAL */}
                {activeTab === "legal" && (
                    <div className="fade-in space-y-4">
                        <div className="p-4 rounded-xl bg-black/20 border border-war-border">
                            <p className="text-sm text-war-text">
                                {report.legal_considerations.summary}
                            </p>
                        </div>

                        {report.legal_considerations.notification_considerations.length >
                            0 && (
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                                        Notification Considerations
                                    </h4>
                                    <div className="space-y-2">
                                        {report.legal_considerations.notification_considerations.map(
                                            (n, i) => (
                                                <div
                                                    key={i}
                                                    className="p-3 rounded-xl bg-black/20 border border-war-border flex items-center gap-3"
                                                >
                                                    <span className="text-sm font-medium text-war-accent min-w-[80px]">
                                                        {n.who}
                                                    </span>
                                                    <span className="text-xs text-war-muted">→</span>
                                                    <span className="text-sm text-war-text">{n.when}</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                            ⚠️ {report.legal_considerations.disclaimer}
                        </div>
                    </div>
                )}

                {/* COMMS */}
                {activeTab === "comms" && (
                    <div className="fade-in space-y-4">
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                                Holding Statement Draft
                            </h4>
                            <div className="p-4 rounded-xl bg-black/20 border border-war-border italic">
                                <p className="text-sm text-war-text leading-relaxed">
                                    &quot;{report.comms.holding_statement_draft}&quot;
                                </p>
                            </div>
                        </div>

                        {report.comms.stakeholder_plan.length > 0 && (
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                                    Stakeholder Plan
                                </h4>
                                <div className="space-y-2">
                                    {report.comms.stakeholder_plan.map((s, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-xl bg-black/20 border border-war-border"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-war-accent uppercase">
                                                    {s.audience}
                                                </span>
                                                <span className="text-xs text-war-muted">via {s.channel}</span>
                                            </div>
                                            <p className="text-xs text-war-text-dim">{s.timing}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* EXECUTIVE */}
                {activeTab === "executive" && (
                    <div className="fade-in space-y-4">
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-2">
                                Executive Summary
                            </h4>
                            <ul className="space-y-2">
                                {report.executive_brief.summary_bullets.map((bullet, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-3 p-3 rounded-xl bg-black/20 border border-war-border text-sm text-war-text"
                                    >
                                        <span className="text-war-accent font-bold mt-0.5">
                                            {i + 1}.
                                        </span>
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <ListSection
                            title="Recommended Decisions"
                            items={report.executive_brief.recommended_decisions}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
