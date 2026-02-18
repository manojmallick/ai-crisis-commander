"use client";

interface ScenarioButtonsProps {
    onSelect: (transcript: string) => void;
    disabled?: boolean;
}

const SCENARIOS = [
    {
        icon: "🔓",
        label: "Data Breach: 50k users",
        color: "from-red-500/20 to-red-900/10",
        borderColor: "border-red-500/30 hover:border-red-400/60",
        transcript:
            "We detected unauthorized access to our customer database. Approximately 50,000 user records may be impacted including emails and hashed passwords. The access might still be ongoing. What actions should we take in the next 60 minutes, and what should we prepare for the next 24 hours?",
    },
    {
        icon: "⚡",
        label: "Cloud Outage: 40 min downtime",
        color: "from-amber-500/20 to-amber-900/10",
        borderColor: "border-amber-500/30 hover:border-amber-400/60",
        transcript:
            "Our main API is returning 500 errors across Europe. Latency spiked 10x and we have ongoing downtime for 40 minutes. We suspect a dependency outage or a bad deployment. What should we do now to restore service safely and communicate status updates?",
    },
    {
        icon: "📢",
        label: "PR Crisis: Viral complaint",
        color: "from-purple-500/20 to-purple-900/10",
        borderColor: "border-purple-500/30 hover:border-purple-400/60",
        transcript:
            "A customer posted a viral video claiming our service exposed their private data. The story is trending and journalists are asking for comment. We need a safe holding statement and a plan for internal coordination and next steps.",
    },
    {
        icon: "💳",
        label: "Fraud: Payment account takeover",
        color: "from-emerald-500/20 to-emerald-900/10",
        borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
        transcript:
            "We see suspicious account takeovers with unusual logins and multiple fraudulent transactions. It may involve credential stuffing. What immediate containment steps should we take and what should we communicate to affected users?",
    },
];

export default function ScenarioButtons({
    onSelect,
    disabled,
}: ScenarioButtonsProps) {
    return (
        <div className="glass-panel p-6 fade-in">
            <div className="section-header">
                <div className="section-icon">🧪</div>
                <h2>Demo Scenarios</h2>
            </div>
            <p className="text-xs text-war-text-dim mb-2">
                Click a scenario to simulate a crisis without using voice input
            </p>
            <p className="text-xs text-green-400/80 mb-4 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                Demo-safe: no microphone required
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCENARIOS.map((scenario) => (
                    <button
                        key={scenario.label}
                        onClick={() => onSelect(scenario.transcript)}
                        disabled={disabled}
                        className={`
              scenario-btn bg-gradient-to-br ${scenario.color} ${scenario.borderColor}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
                    >
                        <span className="text-xl mb-1 block">{scenario.icon}</span>
                        <span className="font-semibold text-sm">{scenario.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
