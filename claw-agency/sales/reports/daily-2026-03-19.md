# ClawOps Daily CIS Report - 2026-03-19

Generated: 2026-03-20 18:08 ET

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Calls | 10 |
| Avg CIS Score | 7.8/25 |
| Human Connect Rate | 50% |
| Total Cost | $0.01 |
| Cost Per Call | $0.001 |
| Hot Leads (Demo/Sale) | 0 |
| Warm Leads (Pitch/Info) | 0 |

## Score Distribution

```
  Excellent (20-25):  0
  Good     (15-19):  0
  Mid      (10-14): ## 2
  Poor     ( 5-9):  ######## 8
```

## Top Call Failures

- **customer-ended-call** (3x)
- **The call ended immediately with no meaningful dialogue.** (2x)
  - Fix: The AI should have introduced itself and asked a question to engage the prospect.
- **The call ended immediately after the greeting.** (2x)
  - Fix: The AI should have introduced itself and asked a question to engage the prospect.
- **customer-did-not-answer** (1x)
- **No dialogue occurred.** (1x)
  - Fix: Ensure the call is connected to a human before starting the conversation.

## Recommended Prompt Changes

1. **[HIGH]** Review call list quality. Too many unanswered calls.
   _Evidence: NO_CONNECT: 50% of all calls. Pre-screen numbers or adjust call times._

2. **[HIGH]** Opener needs work. Reaching humans but not holding attention.
   _Evidence: Only 0% of connected calls reach meaningful engagement._

3. **[HIGH]** AI naturalness needs improvement. Check for filler words, stuttering, identity breaks.
   _Evidence: AI quality avg: 2.50/5. 4 calls scored 1-2._

4. **[MEDIUM]** Too many quick rejects. First impression may be triggering 'sales call' alarm.
   _Evidence: QUICK_REJECT: 50% of all calls._


---

# CIS Pattern Analysis Report

Generated: 2026-03-20 18:08 ET

Total calls analyzed: **10**
Average total score: **7.8/25**

## Dimension Scores

| Dimension | Avg | 1 | 2 | 3 | 4 | 5 |
|-----------|-----|---|---|---|---|---|
| Connect (Reaching a Human) | **2.00** | 5 | 0 | 5 | 0 | 0 |
| Engage (Having a Conversation) | **1.10** | 9 | 1 | 0 | 0 | 0 |
| Pitch (Presenting Value Prop) | **1.00** | 10 | 0 | 0 | 0 | 0 |
| Advance (Moving to Next Step) | **1.00** | 10 | 0 | 0 | 0 | 0 |
| AI Quality (Natural Performance) | **2.70** | 1 | 3 | 4 | 2 | 0 |

**Weakest dimension: Pitch (Presenting Value Prop) (1.00)**

## Call Funnel (Drop-off Analysis)

```
  CONNECT    #########################                             5/  10 (50%)
  ENGAGE                                                           0/   5 (0%)
  PITCH                                                            0/   0 (0%)
  ADVANCE                                                          0/   0 (0%)
```

## Disposition Breakdown

| Disposition | Count | % | Avg Score |
|------------|-------|---|-----------|
| NO_CONNECT | 5 | 50% | 6.6 |
| QUICK_REJECT | 5 | 50% | 9.0 |

## Top 5 Fixable Problems

Average failure turn: **1.0** (where calls stall)

### 1. customer-ended-call (3 occurrences)
**Fix:** No fix suggestion available

### 2. The call ended immediately with no meaningful dialogue. (2 occurrences)
**Fix:** The AI should have introduced itself and asked a question to engage the prospect.

### 3. The call ended immediately after the greeting. (2 occurrences)
**Fix:** The AI should have introduced itself and asked a question to engage the prospect.

### 4. customer-did-not-answer (1 occurrences)
**Fix:** No fix suggestion available

### 5. No dialogue occurred. (1 occurrences)
**Fix:** Ensure the call is connected to a human before starting the conversation.

## Performance by Niche

| Niche | Calls | Avg Score | Connect | Engage | Pitch | Advance | AI Quality |
|-------|-------|-----------|---------|--------|-------|---------|------------|
| PLUMBING | 1 | 10.0 | 3.0 | 1.0 | 1.0 | 1.0 | 4.0 |
| HVAC | 3 | 8.3 | 1.7 | 1.3 | 1.0 | 1.0 | 3.3 |
| UNKNOWN | 2 | 8.0 | 3.0 | 1.0 | 1.0 | 1.0 | 2.0 |
| ELECTRICAL | 2 | 7.0 | 1.0 | 1.0 | 1.0 | 1.0 | 3.0 |
| ROOFING | 2 | 6.5 | 2.0 | 1.0 | 1.0 | 1.0 | 1.5 |

## Performance by Time of Day (ET)

| Hour (ET) | Calls | Avg Score | Connect Rate |
|-----------|-------|-----------|-------------|
| 12:00 | 10 | 7.8 | 50% |

## Performance by Day of Week

| Day | Calls | Avg Score |
|-----|-------|-----------|
| Thursday | 10 | 7.8 |

## Best Calls (Score >= 18)

No calls scored 18+ yet.

## Key Insights

1. **Biggest bottleneck:** ENGAGE stage (0% pass rate)
2. **Best performing niche:** PLUMBING (avg 10.0/25)
3. **Best calling time:** 12:00 ET (avg 7.8/25)
4. **AI quality alert:** Average 2.70/5 - prompt needs improvement
5. **Human connect rate:** 50%
