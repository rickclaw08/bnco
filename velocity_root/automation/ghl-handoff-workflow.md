# GHL Automation Workflow: Velocity Lead Handoff

## Trigger: VAPI "Interested Lead" Webhook

When the VAPI call ends and the lead expressed interest (Scenario B), the end-of-call-report webhook fires to our handler. The handler parses the transcript and call summary to determine disposition.

---

## Workflow Logic

### Step 1: Call Disposition Router

**VAPI end-of-call-report payload includes:**
- `call.id` - call ID
- `call.customer.number` - lead phone
- `call.endedReason` - how the call ended
- `call.costBreakdown` - cost details
- `artifact.transcript` - full transcript text
- `artifact.messages[]` - structured message array
- `analysis.summary` - AI-generated call summary
- `analysis.successEvaluation` - did the call achieve its goal

**Disposition Categories:**
1. **HOT LEAD (Scenario B)** - Lead expressed interest, provided property info, agreed to callback
2. **WARM LEAD** - Listened but noncommittal, said "maybe" or "let me think about it"
3. **VOICEMAIL** - No answer, left voicemail
4. **DNC (Scenario C)** - Said stop, angry, not interested
5. **NO ANSWER** - No pickup, no voicemail option

### Step 2: HOT LEAD Handoff (Priority)

When disposition = HOT LEAD:

1. **Immediately update GHL contact:**
   - Tag: `hot-lead`, `callback-scheduled`
   - Pipeline: Move to "Callback Scheduled" stage
   - Note: Full call transcript + callback time

2. **Alert Brand (3 channels for redundancy):**
   - SMS to (513) 850-6496: "HOT LEAD: [Name] at [Phone] is interested. Callback: [Time]. Property: [Address]. Check GHL for full notes."
   - Telegram notification via OpenClaw
   - GHL task created: "Call [Name] back at [Time]" assigned to Brand

3. **Prep callback package (auto-generated in GHL notes):**
   - Property details (address, appraised value, equity estimate)
   - What the lead said about property condition
   - Their stated minimum walkaway number
   - Lender name and auction date
   - Suggested offer range (MAO calculation)

### Step 3: WARM LEAD Follow-up

When disposition = WARM LEAD:

1. **Update GHL contact:**
   - Tag: `warm-lead`, `needs-follow-up`
   - Pipeline: Move to "Nurture" stage
   - Note: Transcript + summary

2. **Schedule VAPI re-call in 48 hours** (within outbound window)

3. **Alert Brand via Telegram** (lower priority): "Warm lead: [Name] listened but didn't commit. Re-call scheduled for [Date]."

### Step 4: VOICEMAIL Re-queue

When disposition = VOICEMAIL:

1. **Tag contact:** `voicemail-left`
2. **Schedule VAPI re-call in 24 hours** (different time of day)
3. **Max 3 voicemail attempts** before marking as exhausted

### Step 5: DNC Lockout

When disposition = DNC:

1. **Tag contact:** `dnc`, `do-not-contact`
2. **Remove from ALL automation sequences**
3. **Add to DNC list:** `velocity_root/outreach/dnc-list.txt`
4. **No further contact of any kind**

---

## GHL Pipeline Stages

**Pipeline: Project Velocity**

| Stage | Description | Auto-Actions |
|-------|-------------|--------------|
| New Lead | Just scraped, not yet contacted | Queue for outreach |
| First Touch | SMS or call sent | Monitor for response |
| Voicemail Left | VM dropped, waiting for callback | Re-call in 24h |
| Callback Scheduled | Lead interested, callback time set | Alert Brand, prep package |
| Negotiating | Brand in active conversation | Manual |
| PSA Signed | Contract secured | Begin disposition to buyers |
| Assigned | Contract assigned to institutional buyer | Track closing |
| Closed | Deal completed, profit collected | Archive |
| DNC | Do not contact | No actions |
| Dead | Lead disqualified | Archive |

---

## Implementation Notes

### Webhook Endpoint

The VAPI server webhook URL should point to a lightweight handler that:
1. Receives the end-of-call-report
2. Parses the transcript for disposition keywords
3. Calls GHL API to update contact + trigger workflow
4. Sends Brand alert via appropriate channel

**Options for hosting:**
- Fly.io (existing `clawops-vapi-webhook` app) - add a `/velocity/callback` route
- OpenClaw cron job that polls VAPI call logs every 5 minutes during outbound hours
- Manual: Rick checks call logs and updates GHL after each VAPI batch

**Recommended for now:** Manual check after each VAPI batch (simplest, no new infrastructure). Rick polls VAPI API for call results, parses transcripts, updates GHL contacts, and alerts Brand. Graduate to webhook when volume justifies it.

### GHL API Calls for Handoff

```python
# Update contact to HOT LEAD
PUT /contacts/{contactId}
{
  "tags": ["velocity", "hot-lead", "callback-scheduled"],
  "customFields": [{"key": "contact.trade_niche", "field_value": "Real Estate"}]
}

# Add callback note
POST /contacts/{contactId}/notes
{
  "body": "HOT LEAD - CALLBACK SCHEDULED\n\nCallback: [time]\nProperty condition: [from transcript]\nMinimum walkaway: [from transcript]\nFull transcript: [transcript]"
}

# Create task for Brand
POST /contacts/{contactId}/tasks
{
  "title": "Callback: [Name] - [Property]",
  "body": "Lead interested. Call back at [time]. See notes for details.",
  "dueDate": "[callback datetime ISO]",
  "assignedTo": "zboC7MqocHs0uAcnmTJW"
}
```

---

## Cost Tracking

Every VAPI call and GHL API action gets logged to:
`velocity_root/memory/monthly_spend.json`

Budget gate: If monthly total hits $90, all automated outreach pauses.
