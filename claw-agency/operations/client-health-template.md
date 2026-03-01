# Client Health Dashboard - ClawOps

**Purpose:** Track every active client's performance, satisfaction, and churn risk at a glance. Designed for Google Sheets implementation.

---

## Sheet 1: Client Overview

### Column Layout

| Column | Header              | Format / Notes                                      |
|--------|---------------------|-----------------------------------------------------|
| A      | Client ID           | CL-YYYY-NNN (e.g., CL-2026-001)                    |
| B      | Client Name         | Business name                                       |
| C      | Industry            | Restaurant, HVAC, Medical, Legal, etc.              |
| D      | Start Date          | YYYY-MM-DD (go-live date)                           |
| E      | Plan Tier           | Starter / Growth / Pro / Enterprise                 |
| F      | MRR                 | Monthly recurring revenue ($)                       |
| G      | Calls This Week     | Number (updated weekly, Monday reset)               |
| H      | Calls This Month    | Number (updated monthly, 1st reset)                 |
| I      | Calls Total         | Cumulative since go-live                            |
| J      | Issues This Month   | Count of escalations, complaints, or failures       |
| K      | NPS Score           | 0-10 (collected monthly via survey)                 |
| L      | Renewal Date        | YYYY-MM-DD (contract renewal or next billing cycle) |
| M      | Churn Risk          | GREEN / YELLOW / RED (see criteria below)           |
| N      | Upsell Notes        | Free text: expansion opportunities                  |
| O      | Last Check-In       | YYYY-MM-DD (last time we contacted client)          |
| P      | Account Owner       | Who on our team manages this client                 |
| Q      | Notes               | Free text: anything relevant                        |

### Sample Row

| A          | B              | C          | D          | E       | F    | G  | H   | I    | J | K | L          | M     | N                           | O          | P     | Q                    |
|------------|----------------|------------|------------|---------|------|----|-----|------|---|---|------------|-------|-----------------------------|------------|-------|----------------------|
| CL-2026-001| Mario's Pizza  | Restaurant | 2026-03-01 | Growth  | $497 | 47 | 189 | 189  | 1 | 9 | 2026-04-01 | GREEN | 2nd location interested     | 2026-03-14 | Rick  | Happy, may upgrade   |
| CL-2026-002| CoolAir HVAC   | HVAC       | 2026-03-03 | Pro     | $797 | 82 | 312 | 312  | 3 | 7 | 2026-04-03 | YELLOW| Wants SMS add-on            | 2026-03-10 | Rick  | Needs prompt update  |
| CL-2026-003| Smith Law      | Legal      | 2026-03-05 | Starter | $297 | 12 | 48  | 48   | 0 | 8 | 2026-04-05 | GREEN | Could use booking integration| 2026-03-12 | Rick  | Low volume, satisfied|

---

## Churn Risk Criteria

### GREEN (Healthy)

- NPS score 8-10
- Issues this month: 0-1
- Responded to last check-in
- Calls are steady or growing
- No complaints in last 30 days

### YELLOW (Watch)

- NPS score 6-7
- Issues this month: 2-3
- Slow to respond to check-ins (3+ days)
- Call volume declining week over week
- Minor complaints or feature requests unresolved

### RED (At Risk)

- NPS score 0-5
- Issues this month: 4+
- Not responding to check-ins
- Call volume dropped 30%+ from baseline
- Active complaint or refund discussion
- Approaching renewal with no engagement

### Actions by Risk Level

| Risk   | Action Required                                                        | Timeline     |
|--------|------------------------------------------------------------------------|--------------|
| GREEN  | Standard monthly check-in, send report, look for upsell               | Normal cadence|
| YELLOW | Personal call from account owner, address issues, offer concession     | Within 48 hrs|
| RED    | Founder/Brand reaches out personally, offer fix or plan adjustment     | Within 24 hrs|

---

## Sheet 2: Weekly Call Log

Track call performance trends per client.

| Column | Header           | Format / Notes                        |
|--------|------------------|---------------------------------------|
| A      | Client ID        | Link to Sheet 1                       |
| B      | Week Starting    | YYYY-MM-DD (Monday)                   |
| C      | Total Calls      | Count                                 |
| D      | Handled by AI    | Count (resolved without transfer)     |
| E      | Transferred      | Count (sent to human)                 |
| F      | Missed/Failed    | Count (dropped, errors)               |
| G      | Avg Call Duration | Seconds                               |
| H      | Resolution Rate  | % = (D / C) * 100                     |
| I      | Notes            | Any anomalies or issues               |

---

## Sheet 3: NPS Tracking

Monthly satisfaction scores over time.

| Column | Header       | Format / Notes                              |
|--------|-------------|---------------------------------------------|
| A      | Client ID   | Link to Sheet 1                             |
| B      | Month       | YYYY-MM                                     |
| C      | NPS Score   | 0-10                                        |
| D      | Feedback    | Open text from survey                       |
| E      | Follow-Up   | Action taken based on feedback              |

### NPS Collection Process

1. Send survey on the 1st of each month (automated email)
2. Simple format: "On a scale of 0-10, how likely are you to recommend our service?"
3. One follow-up question: "What could we do better?"
4. If no response by the 7th, send one reminder
5. Log score and feedback in this sheet
6. Flag any score below 7 for immediate follow-up

---

## Sheet 4: Revenue Summary

High-level financial tracking.

| Column | Header           | Format / Notes                     |
|--------|------------------|------------------------------------|
| A      | Month            | YYYY-MM                            |
| B      | Total Clients    | Count of active clients            |
| C      | New Clients      | Added this month                   |
| D      | Churned Clients  | Lost this month                    |
| E      | Total MRR        | Sum of all active client MRR       |
| F      | MRR Growth       | $ change from previous month       |
| G      | Churn Rate       | % = (D / B previous month) * 100  |
| H      | Avg Revenue/Client| E / B                             |
| I      | Upsell Revenue   | Additional revenue from upgrades   |
| J      | Notes            | Context on growth/churn            |

---

## Conditional Formatting Rules (Google Sheets)

Apply these to make the dashboard scannable:

1. **Churn Risk (Column M, Sheet 1):**
   - GREEN text = "GREEN" with green background (#C6EFCE)
   - YELLOW text = "YELLOW" with yellow background (#FFEB9C)
   - RED text = "RED" with red background (#FFC7CE)

2. **NPS Score (Column K, Sheet 1):**
   - 8-10: Green background
   - 6-7: Yellow background
   - 0-5: Red background

3. **Issues (Column J, Sheet 1):**
   - 0-1: No highlight
   - 2-3: Yellow background
   - 4+: Red background

4. **Resolution Rate (Column H, Sheet 2):**
   - 90%+: Green background
   - 75-89%: Yellow background
   - Below 75%: Red background

---

## Google Sheets Setup Instructions

1. Create a new Google Sheet named "ClawOps - Client Health Dashboard"
2. Create four tabs: "Client Overview", "Weekly Call Log", "NPS Tracking", "Revenue Summary"
3. Copy column headers from each sheet section above
4. Apply conditional formatting rules listed above
5. Freeze Row 1 (headers) on all sheets
6. Protect the header row from accidental edits
7. Share with team members (Editor access for ops, Viewer for sales)
8. Set up weekly reminder to update call counts (every Monday)
9. Set up monthly reminder to send NPS surveys (1st of month)

---

*Template version 1.0 | ClawOps | Updated 2026-02-28*
