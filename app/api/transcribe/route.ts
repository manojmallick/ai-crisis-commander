import { NextResponse } from "next/server";
import { deepgramTranscribe } from "@/lib/deepgram";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get("content-type") || "audio/webm";
        const audioBytes = await req.arrayBuffer();

        const { transcript, confidence } = await deepgramTranscribe(
            audioBytes,
            contentType
        );

        return NextResponse.json({ transcript, confidence });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json(
            { error: "TRANSCRIBE_FAILED", message },
            { status: 500 }
        );
    }
}
