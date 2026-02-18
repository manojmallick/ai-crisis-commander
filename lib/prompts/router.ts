export function routerPrompt(transcript: string, evidence?: string): string {
    return `
TASK: Classify the crisis, extract key parameters, and propose which agents should run.

INPUTS:
- transcript: ${JSON.stringify(transcript)}
- evidence: ${JSON.stringify(evidence ?? "")}

OUTPUT MUST MATCH THIS JSON SCHEMA EXACTLY:
{
  "crisis_type": "DATA_BREACH|OUTAGE|PR_CRISIS|FRAUD|OTHER",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "time_horizon": "NEXT_60_MIN|NEXT_24_HOURS|NEXT_7_DAYS",
  "key_facts": {
    "what_happened": "string",
    "systems_affected": ["string"],
    "regions_affected": ["string"],
    "estimated_users_impacted": "string",
    "data_types_involved": ["string"],
    "current_status": "string"
  },
  "assumptions": ["string"],
  "missing_information": ["string"],
  "agent_plan": [
    {"agent":"FORENSICS|IMPACT|LEGAL|PR|EXEC","priority":1,"why":"string"}
  ]
}

GUIDANCE:
- If users/data/privacy mentioned -> DATA_BREACH
- If downtime/latency/service down -> OUTAGE
- If press/backlash -> PR_CRISIS
- If payments/chargebacks -> FRAUD
- CRITICAL if large user count, ongoing attack, regulated data, widespread outage, viral PR.

Return only JSON.
`.trim();
}
