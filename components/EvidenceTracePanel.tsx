import type { ReportMeta } from "@/lib/evidence";
import RiskBreakdown from "./RiskBreakdown";

export default function EvidenceTracePanel({ meta }: { meta: ReportMeta }) {
    return (
        <div className="fade-in space-y-6">
            <div className="flex items-center gap-3">
                <div className="section-icon">🔎</div>
                <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Evidence Trace & Provenance
                    </h3>
                    <p className="text-xs text-war-text-dim mt-1">
                        Cryptographic verifiable chain of reasoning and confidence.
                    </p>
                </div>
            </div>

            {/* Pipeline Summary */}
            <div>
                <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-3">
                    Agent Pipeline
                </h4>
                <div className="flex items-center overflow-x-auto pb-4 hide-scrollbar space-x-2 text-xs">
                    <span className="px-2 py-1 bg-black/30 border border-war-border rounded whitespace-nowrap">Router</span>
                    <span className="text-war-muted">→</span>
                    <span className="px-2 py-1 bg-black/30 border border-blue-500/30 rounded text-blue-300 whitespace-nowrap">Specialist Agents</span>
                    <span className="text-war-muted">→</span>
                    <span className="px-2 py-1 bg-black/30 border border-purple-500/30 rounded text-purple-300 whitespace-nowrap">CrossValidator</span>
                    <span className="text-war-muted">→</span>
                    <span className="px-2 py-1 bg-black/30 border border-war-border rounded whitespace-nowrap">Aggregator</span>
                </div>
            </div>

            {/* Agent Provenance */}
            <div>
                <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-3">
                    Agent Provenance & Confidence
                </h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                        <thead>
                            <tr className="border-b border-war-border text-war-text-dim">
                                <th className="py-2 px-3 font-medium">Agent</th>
                                <th className="py-2 px-3 font-medium text-center">Confidence</th>
                                <th className="py-2 px-3 font-medium text-right">Latency</th>
                                <th className="py-2 px-3 font-medium w-full">Produces Fields</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {meta.agents.map((agent) => {
                                const isCrossval = agent.id === "CROSSCHECK";
                                const confPct = Math.round(agent.confidence_0_1 * 100);
                                const confColor = confPct >= 90 ? "text-green-400" : confPct >= 70 ? "text-yellow-400" : "text-amber-400";
                                return (
                                    <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                                        <td className={`py-2 px-3 font-mono ${isCrossval ? "text-purple-400" : "text-war-text"}`}>
                                            {agent.id}
                                        </td>
                                        <td className={`py-2 px-3 text-center font-mono ${confColor}`}>
                                            {confPct}%
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-war-text-dim text-xs">
                                            {agent.latency_ms}ms
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="flex gap-1 flex-wrap overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] md:max-w-md">
                                                {agent.produced.map((f, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-war-accent/10 text-war-accent rounded text-[10px] uppercase">
                                                        {f.split('.').pop()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cross-Validation Impact */}
                <div className="bg-black/20 border border-war-border rounded-xl p-4">
                    <h4 className="text-xs uppercase tracking-wider text-war-text-dim font-semibold mb-3">
                        Cross-Validation Impact
                    </h4>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-center flex-1">
                            <p className="text-[10px] text-war-text-dim uppercase">Before</p>
                            <p className="text-lg font-mono text-war-text">{Math.round(meta.cross_validation.confidence_before_0_1 * 100)}%</p>
                        </div>
                        <div className="text-center font-mono text-sm text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                            {meta.cross_validation.adjustment > 0 ? "+" : ""}{Math.round(meta.cross_validation.adjustment * 100)}%
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-[10px] text-war-text-dim uppercase">After</p>
                            <p className="text-lg font-mono text-blue-400">{Math.round(meta.cross_validation.confidence_after_0_1 * 100)}%</p>
                        </div>
                    </div>
                    {meta.cross_validation.top_conflicts.length > 0 && (
                        <div>
                            <p className="text-[10px] text-war-text-dim mb-1 uppercase">Top Adjustments Found</p>
                            <ul className="space-y-1.5">
                                {meta.cross_validation.top_conflicts.map((c, i) => (
                                    <li key={i} className="text-xs text-war-text pl-3 relative before:content-['⚡'] before:absolute before:left-0 before:-top-0.5 before:text-[10px] bg-white/5 p-1.5 rounded">
                                        <span className="font-mono text-amber-300 mr-2">{c.between}</span>
                                        {c.issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Risk Breakdown */}
                <RiskBreakdown meta={meta} />
            </div>

        </div>
    );
}
