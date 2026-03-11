---
name: ghl-native-pipeline-closer
description: "GoHighLevel (GHL) native pipeline automation and sales specialist. Use when: (1) Building or optimizing GHL workflows to move opportunities through pipeline stages, (2) Setting up native GHL automations for speed-to-lead, no-show nurture, or follow-up sequences, (3) Configuring GHL Voice AI agents, calendar booking, or SMS conversational bots, (4) Troubleshooting GHL pipeline triggers, workflow logic, or automation gaps, (5) Implementing GHL sales hacks (double-dial, stealth voicemail, fast-track pipeline jumping), (6) Explaining GHL terminology (sub-accounts, snapshots, workflows, pipelines, custom values). NOT for: external API integrations, Zapier/Make workflows, or non-GHL platforms."
---

# GHL Native Pipeline Closer

Master skill for moving GHL opportunities from cold lead to booked call using only native GHL features.

## Core Workflow: Lead to Booked Call

Every lead follows this pipeline path. Each stage has a native GHL automation driving it forward.

```
New Lead --> Contacted --> Engaged --> Demo Booked --> Closed Won
   |           |           |            |
   v           v           v            v
  Speed-to   Multi-ch    SMS Bot     No-show
  -lead      follow-up   booking     nurture
  workflow   sequence    sequence    sequence
```

### Stage 1: New Lead (Trigger: Opportunity Created)

Workflow trigger: "Opportunity Created" or "Opportunity Stage Changed to New Lead"

Actions (fire within 60 seconds):
1. Send SMS: personalized intro with calendar link
2. Send Email: value-prop email with CTA
3. If Voice AI enabled: trigger outbound call via Voice AI workflow action
4. Tag contact: "speed-to-lead-fired"
5. Wait 5 minutes
6. If no reply: send second SMS (urgency frame)
7. Move opportunity to "Contacted" stage

### Stage 2: Contacted (Trigger: Stage Changed)

Workflow trigger: "Opportunity Stage Changed to Contacted"

Actions:
1. Wait 1 hour
2. If/Else: Check if contact replied (use "Contact Replied" condition)
   - YES: Move to "Engaged", tag "replied"
   - NO: Send follow-up SMS + email combo
3. Wait 24 hours
4. If still no reply: trigger Voice AI outbound call
5. Wait 48 hours
6. If still no reply: send breakup message ("Last chance before I close your file")
7. If no reply after breakup: move to "Dead Lead" stage, tag "nurture-drip"

### Stage 3: Engaged (Trigger: Contact Replied or Stage Changed)

Workflow trigger: "Contact Replied" + "Opportunity in Engaged stage"

Actions:
1. Send calendar booking link via SMS immediately
2. Wait 30 minutes
3. If no booking: send SMS with urgency ("Only 3 slots left this week")
4. Wait 4 hours
5. If no booking: trigger Voice AI call to book live
6. On booking confirmed (Calendar trigger): move to "Demo Booked"

### Stage 4: Demo Booked (Trigger: Appointment Scheduled)

Workflow trigger: "Appointment Status = Confirmed"

Actions:
1. Send confirmation SMS + email with meeting details
2. 24 hours before: send reminder SMS
3. 1 hour before: send final reminder SMS
4. After appointment time:
   - If/Else: "Appointment Status = Showed"
     - YES: move to "Closed Won" or handle manually
     - NO: fire no-show nurture sequence (see sales hacks)

## Key Native GHL Tools

### Workflows
The automation engine. Every stage transition uses a workflow.
- Triggers: Opportunity Created/Changed, Contact Reply, Appointment events, Tag Applied
- Actions: SMS, Email, Voice AI Call, Wait, If/Else, Move Opportunity, Add/Remove Tag
- See [references/ghl_workflow_logic.md](references/ghl_workflow_logic.md) for trigger/action patterns

### Pipelines & Opportunities
Track every lead's position. One pipeline per offer. Stages map to buyer journey.
- Move opportunities via workflow actions, not manually
- Use "Opportunity Value" to track deal size
- See [references/ghl_terminology.md](references/ghl_terminology.md) for full glossary

### Calendar
Native booking with consent capture.
- Calendar widget captures Voice AI outbound consent
- Embed in SMS/email for frictionless booking
- Configure availability, buffer times, and confirmation workflows

### Smart Lists
Filter contacts by tags, stages, activity. Use for:
- "Leads contacted but no reply in 48h"
- "Booked but no-showed"
- Bulk re-enrollment into workflows

### Voice AI Agents
Native outbound/inbound call handling.
- Configure per-niche agents with custom prompts
- Outbound requires consent (calendar booking or form submission)
- Calling hours: 10 AM - 6 PM in contact's timezone
- 100 calls/day/location, 1 call/min rate limit

## Sales Hack Framework

Proven native GHL tactics for higher conversion. Full implementation details in
[references/ghl_sales_hacks.md](references/ghl_sales_hacks.md).

### Quick Reference

| Hack | Purpose | Key Mechanic |
|------|---------|-------------|
| 5-Minute Rule | Speed to lead | Workflow fires SMS+call within 5 min of lead creation |
| Double-Dial | Increase pickup rate | Two calls 3 min apart, different Voice AI agents |
| Stealth Voicemail | Leave VM without ringing | Voicemail Drop action in workflow |
| No-Show Nurture | Recover missed demos | 3-touch sequence over 48h post no-show |
| SMS Booking Bot | Conversational booking | If/Else chains responding to SMS replies with calendar links |
| Pipeline Jump | Accelerate hot leads | Tag-based trigger skips stages for high-intent signals |
| Breakup Sequence | Force response | Final "closing your file" message triggers loss aversion |
| Ringless VM + SMS | One-two punch | VM drop followed by SMS 2 min later |

## Troubleshooting

### Common Issues

**Workflow not firing:**
- Check trigger conditions match exactly (stage name, pipeline ID)
- Verify contact is enrolled (check contact timeline)
- Check workflow is "Published" not "Draft"
- Check for conflicting workflows that might remove the contact

**Opportunity not moving stages:**
- Verify "Update Opportunity" action has correct pipeline + stage selected
- Check If/Else conditions are evaluating correctly
- Look for wait steps that haven't resolved yet

**Voice AI calls not going out:**
- Verify consent exists (calendar booking with checkbox)
- Check calling hours (10 AM - 6 PM contact timezone)
- Check daily limit (100/location/day)
- Verify phone number is assigned to agent
- Check "Update Disclosure" banner is cleared

**SMS not delivering:**
- Check A2P registration status in Trust Center
- Verify phone number has SMS capability
- Check for opt-out tags on contact

## Implementation Checklist

When setting up a new pipeline closer system:

1. [ ] Create pipeline with correct stages (New Lead, Contacted, Engaged, Demo Booked, Closed Won, Dead Lead)
2. [ ] Create all tags (speed-to-lead-fired, replied, no-show, nurture-drip, hot-lead, breakup-sent)
3. [ ] Build Stage 1 workflow (speed-to-lead)
4. [ ] Build Stage 2 workflow (multi-channel follow-up)
5. [ ] Build Stage 3 workflow (engagement to booking)
6. [ ] Build Stage 4 workflow (appointment reminders + no-show nurture)
7. [ ] Configure Voice AI agents with niche-specific prompts
8. [ ] Set up calendar with consent checkbox enabled
9. [ ] Create Smart Lists for monitoring (no-reply 48h, no-shows, hot leads)
10. [ ] Test end-to-end with a test contact
11. [ ] Verify all disclosure/consent requirements are met
12. [ ] Publish all workflows and monitor for 24h
