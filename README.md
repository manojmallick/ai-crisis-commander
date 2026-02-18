# 🚨 AI Crisis Commander

**Voice-controlled multi-agent war room.** Activate 8 specialized AI agents to produce a structured crisis response plan in seconds — not hours.

> Your first hour of crisis response is usually chaos. This replaces it with structure, cross-validated intelligence, and executive-ready output.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🎙️ Voice Input | Describe the crisis naturally — or use demo scenarios |
| 🧭 Multi-Agent Pipeline | 8 agents run in parallel: Router → Forensics, Impact, Legal, PR, Exec → Cross-Validator → Aggregator |
| 📊 Risk Assessment | Animated gauge with severity classification |
| 🗺️ Risk Heatmap | 5×3 grid across categories and time horizons |
| 🎯 Confidence Breakdown | Transparent scoring with explainable factors |
| 🛡️ Decision Robustness | "If We're Wrong" analysis — recommendations valid regardless of root cause |
| 🔀 Cross-Validation | Agent critiques other agents for conflicts and overconfidence |
| 📣 Escalation Badge | PagerDuty-grade SEV classification |
| ⏱️ Lifecycle Timeline | NIST SP 800-61 incident phases |
| 💬 Slack War Room | One-click formatted message for #incident-war-room |
| 📄 Board Brief | Print-optimized PDF export for C-suite |
| ⏱️ Decision Windows | 30m / 2h / 72h urgency framework |

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **AI Engine:** You.com Smart API (multi-agent)
- **Styling:** Tailwind CSS + custom glassmorphism design system
- **Voice:** Web Speech API
- **Export:** Browser Print-to-PDF, JSON download, clipboard

## 🚀 Quick Start

```bash
npm install
echo "YOU_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 90-Second Demo Script

1. **"Crisis happens."** — Click "Data Breach: 50k users" scenario
2. **Agents activate** — Watch 8 agents light up in real time
3. **Escalation badge** — SEV-0 Board Attention Required appears
4. **Lifecycle timeline** — NIST phases: Detect ✓ → Contain 🔴
5. **Risk heatmap fills** — 5×3 grid shows severity decay over time
6. **Executive brief** — Toggle to C-Suite Ready view with decision windows
7. **Confidence breakdown** — Expand to show positive/negative factors
8. **"If We're Wrong"** — Show decision robustness section
9. **Slack message** — Copy button auto-generates #incident-war-room post
10. **Board brief** — Print clean PDF for the board

> **Close with:** "This replaces the first chaotic hour of crisis alignment."

## 🗺️ Roadmap

### Planned Integrations
- **Slack** — Webhook auto-post to #incident-war-room
- **PagerDuty** — Auto-trigger incident with severity mapping
- **SIEM** — Splunk / Datadog log ingestion for forensic context
- **Regulatory DB** — GDPR, CCPA, HIPAA notification deadline lookup
- **RBAC** — Role-based access: analyst, manager, executive views
- **Audit Trail** — Immutable decision log with timestamps
- **Runbook Integration** — Auto-match crisis type to existing SOPs

### Enterprise Readiness
- SSO / SAML authentication
- Data residency controls
- Custom agent training per organization
- API-first architecture for CI/CD pipeline integration

## ⚖️ Disclaimer

AI Crisis Commander is an **assistive tool only**. It is not legal advice. All outputs include confidence indicators, assumption lists, and missing information flags to support — not replace — human decision-making.

---

Built with ❤️ for rapid crisis response.
