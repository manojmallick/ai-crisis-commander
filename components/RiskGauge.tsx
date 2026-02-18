"use client";

import { useEffect, useState } from "react";

interface RiskGaugeProps {
    score: number; // 0–100
    confidence: number; // 0–1
}

function scoreColor(score: number): string {
    if (score <= 30) return "#22c55e";
    if (score <= 60) return "#f59e0b";
    if (score <= 80) return "#f97316";
    return "#ef4444";
}

function scoreLabel(score: number): string {
    if (score <= 30) return "LOW";
    if (score <= 60) return "MEDIUM";
    if (score <= 80) return "HIGH";
    return "CRITICAL";
}

export default function RiskGauge({ score, confidence }: RiskGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        // Animate score from 0 to target
        const duration = 1200;
        const start = Date.now();
        const from = animatedScore;
        const to = score;

        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(from + (to - from) * eased));
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }, [score]);

    const color = scoreColor(animatedScore);
    const label = scoreLabel(animatedScore);

    // SVG arc calculation
    const radius = 80;
    const circumference = Math.PI * radius; // semi-circle
    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="glass-panel p-6 fade-in flex flex-col items-center">
            <div className="section-header w-full">
                <div className="section-icon">📊</div>
                <h2>Risk Assessment</h2>
            </div>

            {/* Gauge SVG */}
            <div className="relative w-48 h-28 mt-2">
                <svg
                    viewBox="0 0 200 110"
                    className="w-full h-full"
                    style={{ overflow: "visible" }}
                >
                    {/* Background arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="rgba(30, 41, 59, 0.6)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Colored arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="gauge-ring"
                        style={{
                            filter: `drop-shadow(0 0 8px ${color}60)`,
                        }}
                    />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex items-end justify-center pb-0">
                    <div className="text-center">
                        <p
                            className="text-4xl font-extrabold tabular-nums"
                            style={{ color }}
                        >
                            {animatedScore}
                        </p>
                    </div>
                </div>
            </div>

            {/* Label + Confidence */}
            <div
                className="severity-badge mt-3"
                style={{
                    background: `${color}20`,
                    color,
                    borderColor: `${color}40`,
                }}
            >
                {label}
            </div>

            <p className="text-xs text-war-text-dim mt-3">
                Confidence:{" "}
                <span className="font-mono font-semibold text-war-text">
                    {Math.round(confidence * 100)}%
                </span>
            </p>
        </div>
    );
}
