export async function deepgramTranscribe(
    audioBytes: ArrayBuffer,
    mimeType: string
): Promise<{ transcript: string; confidence: number }> {
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) {
        throw new Error("Missing DEEPGRAM_API_KEY environment variable");
    }

    const res = await fetch(
        "https://api.deepgram.com/v1/listen?punctuate=true&smart_format=true",
        {
            method: "POST",
            headers: {
                Authorization: `Token ${key}`,
                "Content-Type": mimeType,
            },
            body: Buffer.from(audioBytes),
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Deepgram error ${res.status}: ${text}`);
    }

    const data = await res.json();

    const transcript: string =
        data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
    const confidence: number =
        data?.results?.channels?.[0]?.alternatives?.[0]?.confidence ?? 0;

    return { transcript, confidence };
}
