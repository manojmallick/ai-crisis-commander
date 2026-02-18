import { safeJsonParse } from "./utils";

type YouCallArgs = {
    system: string;
    prompt: string;
    temperature?: number;
};

/**
 * Calls the You.com Express Agent API with a combined system+user prompt
 * and parses the response as strict JSON.
 *
 * The Express Agent is an LLM endpoint that can optionally ground answers
 * with web search. We send our system instructions + user prompt as one
 * combined input, requesting JSON output.
 */
export async function callYouJSON(args: YouCallArgs): Promise<unknown> {
    const apiKey = process.env.YOU_API_KEY;

    console.log("[YOU_CLIENT] ENV check:", {
        hasApiKey: !!apiKey,
        apiKeyPreview: apiKey ? `${apiKey.slice(0, 8)}...` : "(missing)",
    });

    if (!apiKey) {
        throw new Error("Missing YOU_API_KEY environment variable");
    }

    // Combine system instructions + user prompt into a single input
    const combinedInput = `${args.system}\n\n---\n\n${args.prompt}`;

    const url = "https://api.you.com/v1/agents/runs";
    const payload = {
        agent: "express",
        input: combinedInput,
        stream: false,
    };

    console.log("[YOU_CLIENT] Calling:", url);
    console.log("[YOU_CLIENT] Input length:", combinedInput.length, "chars");

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    console.log("[YOU_CLIENT] Response status:", res.status, res.statusText);

    if (!res.ok) {
        const text = await res.text();
        console.error("[YOU_CLIENT] ❌ API error response:", text.slice(0, 500));
        throw new Error(`You.com API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log("[YOU_CLIENT] Response keys:", Object.keys(data));

    // Extract the answer text from the Express Agent response
    // Response format: { output: [{ type: "message.answer", text: "..." }, ...] }
    let content = "";

    if (Array.isArray(data.output)) {
        for (const item of data.output) {
            if (item.type === "message.answer" && item.text) {
                content = item.text;
                break;
            }
        }
    }

    console.log("[YOU_CLIENT] Content length:", content.length, "| Preview:", content.slice(0, 200));

    if (!content) {
        console.error("[YOU_CLIENT] ❌ No answer text in response. Full output:", JSON.stringify(data.output)?.slice(0, 500));
        throw new Error("No answer text found in You.com response");
    }

    // The LLM may wrap JSON in markdown code fences — strip them
    let jsonStr = content.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
        jsonStr = fenceMatch[1].trim();
    }

    const parsed = safeJsonParse(jsonStr);
    if (parsed === null) {
        console.error("[YOU_CLIENT] ❌ Failed to parse JSON. Raw content:", content.slice(0, 500));
        throw new Error(
            `Failed to parse JSON from You.com response: ${content.slice(0, 300)}`
        );
    }

    console.log("[YOU_CLIENT] ✅ Parsed JSON successfully");
    return parsed;
}
