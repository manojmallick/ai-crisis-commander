"use client";

export type AgentStatus = "idle" | "queued" | "running" | "done" | "error";

export interface AgentState {
    name: string;
    displayName: string;
    icon: string;
    status: AgentStatus;
}

interface AgentStatusPanelProps {
    agents: AgentState[];
}

function StatusIndicator({ status }: { status: AgentStatus }) {
    switch (status) {
        case "idle":
            return (
                <span className="inline-block w-3 h-3 rounded-full bg-war-muted/20" />
            );
        case "queued":
            return (
                <span className="inline-block w-3 h-3 rounded-full bg-war-muted/40" />
            );
        case "running":
            return <span className="status-running" />;
        case "done":
            return <span className="status-done text-lg">✓</span>;
        case "error":
            return <span className="status-error text-lg">✕</span>;
    }
}

function statusLabel(status: AgentStatus): string {
    switch (status) {
        case "idle":
            return "Standby";
        case "queued":
            return "Queued";
        case "running":
            return "Running";
        case "done":
            return "Complete";
        case "error":
            return "Failed";
    }
}

export default function AgentStatusPanel({ agents }: AgentStatusPanelProps) {
    const done = agents.filter((a) => a.status === "done").length;
    const total = agents.length;

    return (
        <div className="glass-panel p-4 fade-in">
            <div className="section-header">
                <div className="section-icon text-base">🤖</div>
                <h2 className="text-sm">Agent War Room</h2>
                <span className="ml-auto text-xs text-war-text-dim font-mono">
                    {done}/{total} complete
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-war-border mb-3 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
                    style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                />
            </div>

            <div className="space-y-1.5">
                {agents.map((agent) => (
                    <div
                        key={agent.name}
                        className={`
              flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all duration-300
              ${agent.status === "running"
                                ? "border-blue-500/40 bg-blue-500/5"
                                : agent.status === "done"
                                    ? "border-green-500/20 bg-green-500/5"
                                    : agent.status === "error"
                                        ? "border-red-500/20 bg-red-500/5"
                                        : "border-war-border bg-black/20"
                            }
            `}
                    >
                        <span className="text-sm">{agent.icon}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-war-text truncate">
                                {agent.displayName}
                            </p>
                        </div>
                        <span className={`text-[10px] ${agent.status === "running"
                            ? "text-blue-400"
                            : agent.status === "done"
                                ? "text-green-400"
                                : agent.status === "error"
                                    ? "text-red-400"
                                    : "text-war-muted"
                            }`}>
                            {statusLabel(agent.status)}
                        </span>
                        <StatusIndicator status={agent.status} />
                    </div>
                ))}
            </div>
        </div>
    );
}
