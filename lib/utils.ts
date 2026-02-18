/** Merge class names (simple implementation without clsx dependency) */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

/** Safely parse JSON, returning null on failure */
export function safeJsonParse<T = unknown>(text: string): T | null {
    try {
        // Strip markdown code fences if present
        const cleaned = text
            .replace(/^```(?:json)?\s*\n?/i, "")
            .replace(/\n?```\s*$/i, "")
            .trim();
        return JSON.parse(cleaned) as T;
    } catch {
        return null;
    }
}

/** Format a risk score into a human-readable label */
export function riskLabel(score: number): string {
    if (score <= 30) return "LOW";
    if (score <= 60) return "MEDIUM";
    if (score <= 80) return "HIGH";
    return "CRITICAL";
}

/** Format a confidence value (0–1) as a percentage string */
export function confidencePercent(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
}

/** Download an object as a formatted JSON file */
export function downloadJson(filename: string, obj: unknown): void {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/** Generate a timestamped filename for crisis report export */
export function crisisReportFilename(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `crisis-report-${date}-${time}.json`;
}
