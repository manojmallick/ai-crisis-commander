import type { CrisisReport } from "./schemas";

/* ────────── Helpers ────────── */

function severityEmoji(sev: string): string {
    switch (sev) {
        case "CRITICAL":
            return "🔴";
        case "HIGH":
            return "🟠";
        case "MEDIUM":
            return "🟡";
        default:
            return "🟢";
    }
}

function sevPrefix(sev: string): string {
    switch (sev) {
        case "CRITICAL":
            return "SEV-0";
        case "HIGH":
            return "SEV-1";
        case "MEDIUM":
            return "SEV-2";
        default:
            return "SEV-3";
    }
}

/* ────────── Main ────────── */

export function generateSlackMessage(report: CrisisReport): string {
    const emoji = severityEmoji(report.severity);
    const sev = sevPrefix(report.severity);
    const crisisLabel = report.crisis_type.replace(/_/g, " ");
    const conf = Math.round(report.confidence_0_1 * 100);
    const ts = new Date().toISOString().slice(0, 16).replace("T", " ");

    const lines: string[] = [];

    // Header
    lines.push(
        `${emoji} *[${sev}] Incident Update — ${crisisLabel}* (Risk ${report.risk_score_0_100}/100, Conf ${conf}%)`
    );
    lines.push("");

    // Summary bullets
    if (report.executive_brief?.summary_bullets?.length) {
        lines.push("*Summary:*");
        for (const b of report.executive_brief.summary_bullets) {
            lines.push(`• ${b}`);
        }
        lines.push("");
    } else if (report.one_paragraph_summary) {
        lines.push("*Summary:*");
        lines.push(report.one_paragraph_summary);
        lines.push("");
    }

    // Immediate actions
    if (report.action_plan?.next_60_minutes?.length) {
        lines.push("*Immediate actions (0–60 min):*");
        report.action_plan.next_60_minutes.forEach((a, i) => {
            lines.push(`${i + 1}) ${a}`);
        });
        lines.push("");
    }

    // Owner requests (stakeholders)
    if (report.comms?.stakeholder_plan?.length) {
        lines.push("*Owner requests:*");
        for (const s of report.comms.stakeholder_plan.slice(0, 4)) {
            lines.push(`- *${s.audience}*: ${s.timing} (via ${s.channel})`);
        }
        lines.push("");
    }

    // Notifications
    if (report.legal_considerations?.notification_considerations?.length) {
        lines.push("*Notifications required:*");
        for (const n of report.legal_considerations.notification_considerations) {
            lines.push(`- ${n.who}: ${n.when}`);
        }
        lines.push("");
    }

    // Footer
    lines.push(`_Next update: 30 minutes · Generated ${ts} UTC_`);

    return lines.join("\n");
}
