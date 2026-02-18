"use client";

import type { CrisisReport } from "@/lib/schemas";
import {
    computeHeatmap,
    TIME_HORIZONS,
    HEAT_COLORS,
} from "@/lib/heatmap";

interface RiskHeatmapProps {
    report: CrisisReport | null;
}

export default function RiskHeatmap({ report }: RiskHeatmapProps) {
    const rows = report ? computeHeatmap(report) : null;

    return (
        <div className="glass-panel p-5 fade-in">
            <div className="section-header">
                <div className="section-icon">🗺️</div>
                <h2>Risk Heatmap</h2>
            </div>

            {!rows ? (
                <div className="text-center py-6">
                    <p className="text-sm text-war-muted italic">Awaiting report…</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    {/* Column Headers */}
                    <div className="grid grid-cols-[100px_1fr_1fr_1fr] gap-1.5 mb-1.5">
                        <div /> {/* empty corner */}
                        {TIME_HORIZONS.map((h) => (
                            <div
                                key={h}
                                className="text-[10px] font-mono uppercase tracking-wider text-war-text-dim text-center py-1"
                            >
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {rows.map((row) => (
                        <div
                            key={row.category}
                            className="grid grid-cols-[100px_1fr_1fr_1fr] gap-1.5 mb-1.5"
                        >
                            {/* Row label */}
                            <div className="flex items-center gap-1.5 pr-2">
                                <span className="text-sm">{row.icon}</span>
                                <span className="text-xs font-semibold text-war-text truncate">
                                    {row.category}
                                </span>
                            </div>

                            {/* Cells */}
                            {row.cells.map((cell, i) => (
                                <div
                                    key={i}
                                    className={`rounded-lg border px-2 py-2 text-center transition-all ${HEAT_COLORS[cell.score]}`}
                                    title={`${row.category} × ${TIME_HORIZONS[i]}: Score ${cell.score}/3`}
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-wide">
                                        {cell.score}/3
                                    </p>
                                    <p className="text-[10px] leading-tight mt-0.5 opacity-80">
                                        {cell.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-war-border">
                        {([0, 1, 2, 3] as const).map((lvl) => (
                            <div key={lvl} className="flex items-center gap-1">
                                <div
                                    className={`w-2.5 h-2.5 rounded-sm ${HEAT_COLORS[lvl].split(" ")[0]}`}
                                />
                                <span className="text-[9px] text-war-muted font-mono">
                                    {lvl === 0
                                        ? "Low"
                                        : lvl === 1
                                            ? "Med"
                                            : lvl === 2
                                                ? "High"
                                                : "Crit"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
