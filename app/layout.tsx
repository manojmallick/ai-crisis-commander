import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI Crisis Commander — War Room",
    description:
        "Voice-controlled multi-agent crisis response system. Activate specialized AI agents to produce structured crisis response plans in seconds.",
    keywords: [
        "crisis response",
        "incident management",
        "AI agents",
        "war room",
        "voice-controlled",
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="war-room-bg min-h-screen">{children}</body>
        </html>
    );
}
