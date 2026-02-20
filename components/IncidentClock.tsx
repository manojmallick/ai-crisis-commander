import { formatUTC } from "@/lib/time";
import type { CrisisReport } from "@/lib/schemas";
import { useEffect, useState } from "react";

interface IncidentClockProps {
    report: CrisisReport | null;
    startedAtISO: string | null;
}

export default function IncidentClock({ report, startedAtISO }: IncidentClockProps) {
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    useEffect(() => {
        if (!startedAtISO) {
            setElapsedMinutes(0);
            return;
        }

        const computeElapsed = () => {
            const startMs = new Date(startedAtISO).getTime();
            const nowMs = Date.now();
            return Math.max(0, Math.floor((nowMs - startMs) / 60000));
        };

        // initial
        setElapsedMinutes(computeElapsed());

        // update every 30 seconds to be safe
        const interval = setInterval(() => {
            setElapsedMinutes(computeElapsed());
        }, 30000);

        return () => clearInterval(interval);
    }, [startedAtISO]);

    if (!report || !startedAtISO) return null;

    const activatedUTC = formatUTC(startedAtISO);
    // Hardcode 30 as requested by the user, clamp remaining
    const remaining = Math.max(0, 30 - elapsedMinutes);
    const decisionWindowText = `30 min (${remaining}m remaining)`;

    return (
        <div className="hidden sm:flex flex-col text-right mr-4 border-r border-war-border pr-4 fade-in">
            <p className="text-[10px] text-war-text-dim uppercase tracking-wider">Incident Activated</p>
            <p className="text-sm font-mono text-war-text font-semibold mb-1">{activatedUTC}</p>
            <div className="mt-1">
                <p className="text-[10px] text-war-text-dim uppercase tracking-wider">Next Decision Window</p>
                <p className="text-sm font-mono text-amber-400 font-semibold">{decisionWindowText}</p>
            </div>
        </div>
    );
}
