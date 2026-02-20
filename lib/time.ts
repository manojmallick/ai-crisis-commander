import type { CrisisReport } from "./schemas";

export function formatUTC(isoString: string): string {
    if (!isoString) return "--:-- UTC";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "--:-- UTC";

    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");

    return `${hh}:${mm} UTC`;
}

export function getDecisionWindow(report: CrisisReport): string {
    // Trivial heuristic based on severity or action plan
    // You already show “30m / 2h / 72h” cards. Pick smallest → “Next Decision Window”.
    if (report.severity === "CRITICAL") return "30 min";
    if (report.severity === "HIGH") return "45 min";
    if (report.severity === "MEDIUM") return "2 hours";
    return "24 hours";
}
