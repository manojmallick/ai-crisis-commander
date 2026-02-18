export function aggregatorPrompt(payload: {
    router: unknown;
    forensics: unknown;
    impact: unknown;
    legal: unknown;
    pr: unknown;
    exec: unknown;
}): string {
    return `
TASK: Merge agent outputs into a single Crisis Report with strict structure, plus risk score rationale.

INPUTS:
- router: ${JSON.stringify(payload.router)}
- forensics: ${JSON.stringify(payload.forensics)}
- impact: ${JSON.stringify(payload.impact)}
- legal: ${JSON.stringify(payload.legal)}
- pr: ${JSON.stringify(payload.pr)}
- exec: ${JSON.stringify(payload.exec)}

OUTPUT MUST MATCH THIS JSON SCHEMA EXACTLY:
{
  "crisis_report_version": "1.0",
  "crisis_type": "DATA_BREACH|OUTAGE|PR_CRISIS|FRAUD|OTHER",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "risk_score_0_100": 0,
  "confidence_0_1": 0,
  "one_paragraph_summary": "string",
  "action_plan": {
    "next_60_minutes": ["string"],
    "next_24_hours": ["string"],
    "next_7_days": ["string"]
  },
  "forensics": {
    "root_cause_hypotheses": [
      {
        "hypothesis": "string",
        "likelihood": "LOW|MEDIUM|HIGH"
      }
    ],
    "containment_steps": ["string"]
  },
  "impact": {
    "impact_summary": "string",
    "users_affected_range": "string",
    "financial_risk_band": "LOW|MEDIUM|HIGH"
  },
  "legal_considerations": {
    "summary": "string",
    "notification_considerations": [
      {
        "who": "string",
        "when": "string"
      }
    ],
    "disclaimer": "string"
  },
  "comms": {
    "holding_statement_draft": "string",
    "stakeholder_plan": [
      {
        "audience": "string",
        "channel": "string",
        "timing": "string"
      }
    ]
  },
  "executive_brief": {
    "summary_bullets": ["string","string","string","string","string"],
    "recommended_decisions": ["string"]
  },
  "assumptions": ["string"],
  "missing_information": ["string"]
}

RISK SCORE GUIDANCE:
- Use severity + user count + ongoing attack + regulated data + outage scope.
- 0–30 low, 31–60 medium, 61–80 high, 81–100 critical.
CONFIDENCE:
- Higher if evidence is concrete and consistent; lower if many assumptions.

Return only JSON.
`.trim();
}
