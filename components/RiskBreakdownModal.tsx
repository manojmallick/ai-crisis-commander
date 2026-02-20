import { type RiskBreakdownResult, formatScoringProfile } from "@/lib/riskBreakdown";
import { useEffect } from "react";

interface RiskBreakdownModalProps {
    open: boolean;
    onClose: () => void;
    breakdown: RiskBreakdownResult;
    riskScore: number;
}

export default function RiskBreakdownModal({ open, onClose, breakdown, riskScore }: RiskBreakdownModalProps) {
    const isMatch = Math.abs(riskScore - breakdown.finalScore) <= 2;
    const finalScoreToDisplay = isMatch ? riskScore : breakdown.finalScore;

    const profileBadgeText = formatScoringProfile(breakdown.profile);

    // Basic escape key handler
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in cursor-default" onClick={onClose}>
            {/* Modal Content */}
            <div
                className="bg-[#0b101e] border border-war-border p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-2">
                    <p className="text-[10px] uppercase tracking-tighter text-war-text-dim/80 mb-1 font-semibold leading-none text-left">
                        Score derived from structured incident factors
                    </p>
                    <div className="flex flex-col gap-1.5 mt-3">
                        <span className="text-xs text-war-text-dim/70">
                            {profileBadgeText}
                        </span>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Risk Score Breakdown
                            </h3>
                            <button onClick={onClose} className="text-war-text-dim hover:text-white transition-colors">
                                ✕
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-base font-semibold text-war-text flex items-center gap-2">
                        Risk Score: <span className="font-mono text-amber-400 text-lg">{finalScoreToDisplay}/100</span>
                    </p>
                    <p className="text-sm text-war-text-dim/60 mt-1">
                        Raw Sum: {breakdown.rawSum} {breakdown.rawSum > 100 && <span className="text-[11px] opacity-70 ml-1">(capped at 100)</span>}
                    </p>
                    {!isMatch && (
                        <p className="text-[9px] text-amber-500/70 mt-1 font-medium">
                            ⚠️ Score recomputed from factors
                        </p>
                    )}
                </div>

                <div className="bg-black/40 border border-war-border rounded-xl p-4 mb-4 flex flex-col">
                    <div className="flex flex-col divide-y divide-war-border/30 mb-4">
                        {breakdown.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-start py-4 first:pt-0 last:pb-0">
                                <div className="leading-tight">
                                    <p className="text-[13px] font-medium text-war-text">{item.label}</p>
                                    <p className="text-[11px] text-war-text-dim opacity-70 mt-1">{item.reason}</p>
                                </div>
                                <span className="font-mono font-black text-cyan-200 brightness-125 drop-shadow-[0_0_4px_rgba(103,232,249,0.6)] shrink-0 ml-4 text-[15px] mt-0.5">
                                    +{item.points}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t-2 border-war-border/60 flex justify-between items-end">
                        <span className="text-sm font-bold text-war-text-dim uppercase tracking-widest mb-1">Deterministic Final Score</span>
                        <span className={`text-5xl font-black font-mono leading-none tracking-tight ${finalScoreToDisplay >= 80 ? "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.6)]" : "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"}`}>
                            {finalScoreToDisplay}
                        </span>
                    </div>
                </div>

                <div className="mt-2 text-[8px] text-war-text-dim/40 opacity-70 italic text-center leading-loose">
                    ✅ Deterministic scoring. Not generated. Used to guide triage, not replace investigators.
                </div>
            </div>
        </div>
    );
}
