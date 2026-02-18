"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import ScenarioButtons from "@/components/ScenarioButtons";
import AgentStatusPanel from "@/components/AgentStatusPanel";
import type { AgentState } from "@/components/AgentStatusPanel";
import RiskGauge from "@/components/RiskGauge";
import ConfidencePanel from "@/components/ConfidencePanel";
import CrisisReportView from "@/components/CrisisReportView";
import RiskHeatmap from "@/components/RiskHeatmap";
import SlackMessage from "@/components/SlackMessage";
import CrosscheckPanel from "@/components/CrosscheckPanel";
import CrisisLifecycle from "@/components/CrisisLifecycle";
import EscalationBadge from "@/components/EscalationBadge";
import type { CrisisReport } from "@/lib/schemas";
import type { CrossCheckResult } from "@/lib/prompts/crosscheck";

/* ────────────────── INITIAL STATE ────────────────── */

const INITIAL_AGENTS: AgentState[] = [
    { name: "ROUTER", displayName: "Crisis Router", icon: "🧭", status: "idle" },
    { name: "FORENSICS", displayName: "Forensics Lead", icon: "🔍", status: "idle" },
    { name: "IMPACT", displayName: "Impact Estimator", icon: "💥", status: "idle" },
    { name: "LEGAL", displayName: "Legal Risk Advisor", icon: "⚖️", status: "idle" },
    { name: "PR", displayName: "PR Strategy", icon: "📢", status: "idle" },
    { name: "EXEC", displayName: "Executive Brief", icon: "👔", status: "idle" },
    { name: "CROSSCHECK", displayName: "Cross-Validator", icon: "🔀", status: "idle" },
    { name: "AGGREGATOR", displayName: "Report Aggregator", icon: "📊", status: "idle" },
];

type AppPhase = "idle" | "recording" | "processing" | "done" | "error";

/* ────────────────── COMPONENT ────────────────── */

export default function Home() {
    const [phase, setPhase] = useState<AppPhase>("idle");
    const [demoMode, setDemoMode] = useState(true);
    const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [report, setReport] = useState<CrisisReport | null>(null);
    const [crosscheck, setCrosscheck] = useState<CrossCheckResult | null>(null);
    const [fullData, setFullData] = useState<Record<string, unknown> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const lastTranscript = useRef<string>("");

    /* ── helpers ── */

    const updateAgent = useCallback(
        (name: string, status: AgentState["status"]) => {
            setAgents((prev) =>
                prev.map((a) => (a.name === name ? { ...a, status } : a))
            );
        },
        []
    );

    const setAllAgents = useCallback((status: AgentState["status"]) => {
        setAgents((prev) => prev.map((a) => ({ ...a, status })));
    }, []);

    const resetAll = useCallback(() => {
        setPhase("idle");
        setAgents(INITIAL_AGENTS);
        setTranscript(null);
        setReport(null);
        setCrosscheck(null);
        setFullData(null);
        setError(null);
    }, []);

    /* ── persist report for Board Brief ── */
    useEffect(() => {
        if (report) {
            try {
                localStorage.setItem("crisis-report", JSON.stringify(report));
            } catch {
                // quota exceeded — ignore
            }
        }
    }, [report]);

    /* ── main crisis pipeline ── */

    const runCrisis = useCallback(
        async (text: string) => {
            lastTranscript.current = text;
            setPhase("processing");
            setTranscript(text);
            setReport(null);
            setCrosscheck(null);
            setFullData(null);
            setError(null);

            // ─── Simulated agent timeline (UX timing) ───
            setAllAgents("queued");
            updateAgent("ROUTER", "running");

            const t1 = setTimeout(() => {
                updateAgent("ROUTER", "done");
                updateAgent("FORENSICS", "running");
                updateAgent("IMPACT", "running");
                updateAgent("LEGAL", "running");
                updateAgent("PR", "running");
                updateAgent("EXEC", "running");
            }, 300);

            const t2 = setTimeout(() => {
                updateAgent("FORENSICS", "done");
                updateAgent("IMPACT", "done");
                updateAgent("LEGAL", "done");
                updateAgent("PR", "done");
                updateAgent("EXEC", "done");
                updateAgent("CROSSCHECK", "running");
            }, 1200);

            const t3 = setTimeout(() => {
                updateAgent("CROSSCHECK", "done");
                updateAgent("AGGREGATOR", "running");
            }, 1800);

            const t4 = setTimeout(() => {
                updateAgent("AGGREGATOR", "done");
            }, 2200);

            try {
                const res = await fetch("/api/crisis", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ transcript: text, evidence: "" }),
                });

                // Clear timers — real response overrides simulation
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
                clearTimeout(t4);

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || `API error ${res.status}`);
                }

                const data = await res.json();

                // All done
                setAllAgents("done");
                setReport(data.report);
                setCrosscheck(data.crosscheck ?? null);
                setFullData(data);
                setPhase("done");
            } catch (e) {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
                clearTimeout(t4);

                setError(
                    e instanceof Error ? e.message : "An unexpected error occurred"
                );
                setAgents((prev) =>
                    prev.map((a) =>
                        a.status === "running"
                            ? { ...a, status: "error" as const }
                            : a
                    )
                );
                setPhase("error");
            }
        },
        [updateAgent, setAllAgents]
    );

    const handleRetry = useCallback(() => {
        if (lastTranscript.current) {
            runCrisis(lastTranscript.current);
        }
    }, [runCrisis]);

    const handleTranscript = useCallback(
        (text: string) => {
            if (text.trim()) {
                runCrisis(text);
            }
        },
        [runCrisis]
    );

    const handleScenario = useCallback(
        (text: string) => {
            runCrisis(text);
        },
        [runCrisis]
    );

    const isProcessing = phase === "processing";

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
            {/* ────── Header ────── */}
            <header className="mb-8 fade-in">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <button
                            onClick={resetAll}
                            className="flex items-center gap-3 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <span className="text-3xl">🚨</span>
                            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                AI Crisis Commander
                            </h1>
                        </button>
                        <p className="text-sm text-war-text-dim max-w-xl">
                            Voice-controlled multi-agent war room. Activate specialized AI
                            agents to produce a structured crisis response plan in seconds.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Demo Mode Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer select-none" htmlFor="demo-toggle">
                            <span className="text-xs text-war-text-dim font-semibold uppercase tracking-wider">
                                Demo
                            </span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="demo-toggle"
                                    checked={demoMode}
                                    onChange={(e) => setDemoMode(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-war-border rounded-full peer-checked:bg-blue-500 transition-colors" />
                                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                            </div>
                        </label>

                        {phase !== "idle" && (
                            <button
                                onClick={resetAll}
                                className="btn-outline"
                                id="reset-btn"
                            >
                                ↻ New Crisis
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 flex items-center gap-3">
                    <div
                        className={`w-2.5 h-2.5 rounded-full ${phase === "idle"
                            ? "bg-war-muted"
                            : phase === "processing"
                                ? "bg-amber-400 animate-pulse"
                                : phase === "done"
                                    ? "bg-green-400"
                                    : "bg-red-400"
                            }`}
                    />
                    <span className="text-xs font-mono text-war-text-dim uppercase tracking-wider">
                        {phase === "idle"
                            ? "Awaiting Input"
                            : phase === "processing"
                                ? "Agents Active"
                                : phase === "done"
                                    ? "Report Ready"
                                    : "Error Occurred"}
                    </span>
                </div>
            </header>

            {/* ────── Input Section ────── */}
            {(phase === "idle" || phase === "error") && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <VoiceRecorder
                        onTranscript={handleTranscript}
                        disabled={isProcessing}
                        demoMode={demoMode}
                    />
                    <ScenarioButtons onSelect={handleScenario} disabled={isProcessing} />
                </div>
            )}

            {/* ────── Error Banner + Retry ────── */}
            {error && (
                <div className="glass-panel p-6 mb-8 border-red-500/30 fade-in">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-400 mb-1">
                                Crisis Analysis Failed
                            </h3>
                            <p className="text-sm text-war-text-dim">{error}</p>
                            <p className="text-xs text-war-muted mt-2">
                                Make sure your API keys are configured in <code className="text-war-accent">.env.local</code>
                            </p>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="btn-outline shrink-0"
                            id="retry-btn"
                        >
                            ↻ Retry
                        </button>
                    </div>
                </div>
            )}

            {/* ────── Transcript Banner (during processing) ────── */}
            {transcript && phase === "processing" && (
                <div className="glass-panel p-4 mb-6 fade-in">
                    <p className="text-xs text-war-text-dim uppercase tracking-wider mb-1 font-semibold">
                        🎙️ Crisis Input
                    </p>
                    <p className="text-sm text-war-text leading-relaxed">{transcript}</p>
                </div>
            )}

            {/* ────── Processing / Results ────── */}
            {(phase === "processing" || phase === "done") && (
                <div className="space-y-6">
                    {/* ── Full-width: Escalation + Lifecycle Banner ── */}
                    {report && (
                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-center fade-in">
                            <EscalationBadge report={report} />
                            <CrisisLifecycle report={report} />
                        </div>
                    )}

                    {/* ── Main Grid: Sidebar + Report ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                        {/* Compact Sidebar */}
                        <div className="space-y-4">
                            <AgentStatusPanel agents={agents} />
                            {report && (
                                <RiskGauge
                                    score={report.risk_score_0_100}
                                    confidence={report.confidence_0_1}
                                />
                            )}
                        </div>

                        {/* Main Report Area */}
                        <div>
                            {report && fullData ? (
                                <div className="space-y-4">
                                    <CrisisReportView report={report} fullData={fullData} />

                                    {/* Board Brief Link */}
                                    <div className="flex justify-end">
                                        <a
                                            href="/brief"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-outline flex items-center gap-2 text-xs"
                                            id="board-brief-btn"
                                        >
                                            📄 Board Brief (Print/PDF)
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-panel p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
                                    <div className="status-running" style={{ width: 40, height: 40, borderWidth: 3 }} />
                                    <p className="text-sm text-war-text-dim">
                                        Agents analyzing crisis...
                                    </p>
                                    <p className="text-xs text-war-muted">
                                        This typically takes 15–30 seconds
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Full-width Bottom Dashboard ── */}
                    {report && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 fade-in">
                            <ConfidencePanel report={report} />
                            <RiskHeatmap report={report} />
                            <SlackMessage report={report} />
                            <CrosscheckPanel crosscheck={crosscheck} />
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <footer className="mt-12 pb-8 text-center">
                <p className="text-xs text-war-muted">
                    AI Crisis Commander — Assistive tool only. Not legal advice. Outputs
                    include confidence indicators and assumption lists.
                </p>
            </footer>
        </main>
    );
}
