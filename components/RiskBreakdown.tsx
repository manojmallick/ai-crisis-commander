import type { ReportMeta } from "@/lib/evidence";
import { formatScoringProfile } from "@/lib/riskBreakdown";

export default function RiskBreakdown({ meta }: { meta: ReportMeta }) {
    const { finalScore: clampedTotal, rawSum, items, profile } = meta.deterministic_risk_breakdown;

    const color = clampedTotal >= 80 ? "text-red-400" : clampedTotal >= 60 ? "text-amber-400" : clampedTotal >= 30 ? "text-yellow-400" : "text-green-400";

    const profileBadgeText = formatScoringProfile(profile);

    return (
        <div className="bg-black/20 border border-war-border rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-1">
                Risk Score Breakdown
            </h4>
            <div className="text-xs text-war-text-dim/70 mb-3">
                {profileBadgeText}
            </div>
            <div className="space-y-2 mb-4">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex gap-2 items-center flex-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-war-accent"></span>
                            <span className="text-war-text">{item.label}</span>
                            <span className="text-[10px] text-war-text-dim opacity-70 hidden sm:inline">({item.reason})</span>
                        </div>
                        <span className="font-mono text-war-accent">
                            {item.points > 0 ? "+" : ""}{item.points}
                        </span>
                    </div>
                ))}
            </div>
            <div className="pt-3 border-t border-war-border">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-war-text-dim">Computed Score:</span>
                    <span className={`text-xl font-bold font-mono ${color}`}>{clampedTotal}/100</span>
                </div>
                <div className="flex justify-end mt-1">
                    <span className="text-[11px] text-war-text-dim/60">
                        Raw Sum: {rawSum} {rawSum > 100 && <span className="text-[10px] opacity-70 ml-0.5">(capped at 100)</span>}
                    </span>
                </div>
            </div>
        </div>
    );
}
