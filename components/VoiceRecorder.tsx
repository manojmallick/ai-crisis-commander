"use client";

import { useState, useRef, useCallback } from "react";

interface VoiceRecorderProps {
    onTranscript: (transcript: string, confidence?: number) => void;
    disabled?: boolean;
    demoMode?: boolean;
}

export default function VoiceRecorder({
    onTranscript,
    disabled,
    demoMode = false,
}: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [textInput, setTextInput] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscript(null);
            setConfidence(null);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm",
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                await transcribeAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch {
            setError(
                "Microphone access denied. Use the text input below or try a Demo Scenario."
            );
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        try {
            const res = await fetch("/api/transcribe", {
                method: "POST",
                headers: { "Content-Type": "audio/webm" },
                body: audioBlob,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Transcription failed");
            }

            const { transcript: t, confidence: c } = await res.json();
            setTranscript(t);
            setConfidence(c);
            onTranscript(t, c);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to transcribe audio"
            );
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleTextSubmit = () => {
        const text = textInput.trim();
        if (text) {
            setTranscript(text);
            onTranscript(text);
            setTextInput("");
        }
    };

    return (
        <div className="glass-panel p-6 fade-in">
            <div className="section-header">
                <div className="section-icon">🎙️</div>
                <h2>Voice Input</h2>
            </div>

            <div className="flex flex-col items-center gap-5">
                {/* Mic Button */}
                <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    disabled={disabled || isTranscribing}
                    className={`
            w-20 h-20 rounded-full flex items-center justify-center text-3xl
            transition-all duration-300 cursor-pointer select-none
            ${isRecording
                            ? "mic-recording"
                            : "bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                        }
            ${disabled || isTranscribing ? "opacity-50 cursor-not-allowed" : ""}
          `}
                    title="Hold to talk"
                >
                    {isTranscribing ? (
                        <div className="status-running" style={{ width: 28, height: 28, borderWidth: 3 }} />
                    ) : (
                        "🎤"
                    )}
                </button>

                <p className="text-sm text-war-text-dim">
                    {isRecording
                        ? "🔴 Recording... Release to send"
                        : isTranscribing
                            ? "Transcribing..."
                            : "Hold to Talk"}
                </p>

                {/* Text Input Fallback (always visible in demo mode) */}
                {(demoMode || error) && (
                    <div className="w-full mt-1">
                        <p className="text-xs text-war-text-dim mb-2">
                            Or type / paste a crisis description:
                        </p>
                        <div className="flex gap-2">
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Describe the crisis situation..."
                                disabled={disabled || isTranscribing}
                                rows={3}
                                className="flex-1 bg-black/30 border border-war-border rounded-xl px-3 py-2 text-sm text-war-text placeholder:text-war-muted focus:outline-none focus:border-blue-500/50 resize-none"
                            />
                            <button
                                onClick={handleTextSubmit}
                                disabled={disabled || isTranscribing || !textInput.trim()}
                                className="btn-outline self-end shrink-0"
                            >
                                Analyze →
                            </button>
                        </div>
                    </div>
                )}

                {/* Transcript Display */}
                {transcript && (
                    <div className="w-full mt-2 p-4 rounded-xl bg-black/30 border border-war-border">
                        <p className="text-xs text-war-text-dim mb-1 uppercase tracking-wider font-semibold">
                            Transcript
                        </p>
                        <p className="text-sm text-war-text leading-relaxed">{transcript}</p>
                        {confidence !== null && (
                            <p className="text-xs text-war-muted mt-2">
                                Confidence: {Math.round(confidence * 100)}%
                            </p>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
