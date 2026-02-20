import type { CrisisReport } from "./schemas";
import type { CrossCheckResult } from "./prompts/crosscheck";

export type DebateLine = {
    agent: "PR" | "LEGAL" | "FORENSICS" | "CROSSCHECK";
    stance: string;
};

export function buildDebateLog(report: CrisisReport, crosscheck: CrossCheckResult | null): DebateLine[] {
    const lines: DebateLine[] = [];

    // Forensics stance
    const topHypothesis = report.forensics.root_cause_hypotheses[0];
    if (topHypothesis) {
        lines.push({
            agent: "FORENSICS",
            stance: `Root cause likelihood [${topHypothesis.likelihood}]: ${topHypothesis.hypothesis.substring(0, 60)}...`
        });
    }

    // Legal stance
    const topNotif = report.legal_considerations.notification_considerations[0];
    if (topNotif) {
        lines.push({
            agent: "LEGAL",
            stance: `Requires notification to ${topNotif.who} within ${topNotif.when}.`
        });
    }

    // PR stance
    const hasHoldingStmt = report.comms.holding_statement_draft.length > 0;
    if (hasHoldingStmt) {
        lines.push({
            agent: "PR",
            stance: "Holding statement drafted. Recommending immediate external broadcast."
        });
    }

    // Crosscheck stance
    if (crosscheck && crosscheck.conflicts.length > 0) {
        const conflict = crosscheck.conflicts[0];
        lines.push({
            agent: "CROSSCHECK",
            stance: `Detected conflict between ${conflict.between}. Resolution: ${conflict.fix}`
        });
    } else if (crosscheck) {
        lines.push({
            agent: "CROSSCHECK",
            stance: "Validating agent alignment. No critical conflicts found. Applying baseline confidence."
        });
    }

    return lines;
}
