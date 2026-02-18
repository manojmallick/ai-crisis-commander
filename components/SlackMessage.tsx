"use client";

import { useState } from "react";
import type { CrisisReport } from "@/lib/schemas";
import { generateSlackMessage } from "@/lib/slackFormat";

interface SlackMessageProps {
    report: CrisisReport;
}

export default function SlackMessage({ report }: SlackMessageProps) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const message = generateSlackMessage(report);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement("textarea");
            textarea.value = message;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="glass-panel p-5 fade-in">
            <div className="section-header">
                <div className="section-icon">💬</div>
                <h2>Slack War Room</h2>
            </div>

            <p className="text-xs text-war-text-dim mb-3">
                One-click #incident-war-room message ready to paste.
            </p>

            {!expanded ? (
                <button
                    onClick={() => setExpanded(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4A154B] to-[#611f69] hover:from-[#5a1d5c] hover:to-[#732882] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    id="generate-slack-btn"
                >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                    </svg>
                    Generate Slack Update
                </button>
            ) : (
                <div>
                    {/* Preview */}
                    <div className="rounded-xl bg-black/40 border border-war-border p-4 font-mono text-xs text-war-text leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                        {message}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleCopy}
                            className={`btn-outline flex-1 text-xs ${copied ? "!border-green-500/50 !text-green-400" : ""}`}
                            id="copy-slack-btn"
                        >
                            {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
                        </button>
                        <button
                            onClick={() => setExpanded(false)}
                            className="btn-outline text-xs"
                        >
                            Collapse
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
