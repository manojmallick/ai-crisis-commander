import { NextResponse } from "next/server";
import { runCrisisWarRoom } from "@/lib/orchestrator";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const transcript = String(body.transcript ?? "").trim();
        const evidence = typeof body.evidence === "string" ? body.evidence : "";

        console.log("[CRISIS] Received request:", {
            transcriptLength: transcript.length,
            transcriptPreview: transcript.slice(0, 100),
            hasEvidence: !!evidence,
        });

        if (!transcript) {
            console.warn("[CRISIS] Missing transcript");
            return NextResponse.json(
                { error: "MISSING_TRANSCRIPT" },
                { status: 400 }
            );
        }

        console.log("[CRISIS] Starting war room orchestration...");
        const result = await runCrisisWarRoom({ transcript, evidence });
        console.log("[CRISIS] ✅ War room completed successfully");

        return NextResponse.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        const stack = e instanceof Error ? e.stack : undefined;
        console.error("[CRISIS] ❌ Error:", message);
        if (stack) console.error("[CRISIS] Stack:", stack);
        return NextResponse.json(
            { error: "CRISIS_FAILED", message },
            { status: 500 }
        );
    }
}
