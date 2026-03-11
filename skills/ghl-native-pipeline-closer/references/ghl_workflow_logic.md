# GHL Workflow Logic Reference

Complete patterns for native GHL workflow triggers, conditions, and actions.

## Trigger Types

### Opportunity Triggers

**Opportunity Created**
- Fires when a new opportunity is added to any pipeline
- Filter by: Pipeline, Stage, Source
- Use for: Speed-to-lead workflows

**Opportunity Stage Changed**
- Fires when an opportunity moves between stages
- Filter by: Pipeline, From Stage, To Stage
- Use for: Stage-specific follow-up sequences
- Note: Also fires on bulk stage moves via Smart Lists

**Opportunity Status Changed**
- Fires when opportunity status changes (Open, Won, Lost, Abandoned)
- Use for: Win/loss post-processing, re-engagement campaigns

### Contact Triggers

**Contact Created**
- Fires on new contact creation (import, form, manual, API)
- Use for: Initial tagging, pipeline opportunity creation

**Contact Replied**
- Fires when contact sends ANY reply (SMS, email, FB, IG, GMB, webchat)
- Critical for engagement detection
- Combine with If/Else to check opportunity stage

**Contact Tag Added**
- Fires when a specific tag is applied
- Use for: Cross-workflow orchestration (tag in one workflow triggers another)
- Pattern: "hot-lead" tag -> skip to fast-track workflow

**Contact DND (Do Not Disturb)**
- Fires when contact opts out
- Use for: Cleanup (remove from active workflows, update opportunity to Lost)

### Appointment Triggers

**Appointment Scheduled**
- Fires when calendar event is booked
- Filter by: Calendar, Status
- Use for: Confirmation sequences, opportunity stage updates

**Appointment Status Changed**
- Statuses: Confirmed, Showed, No-Showed, Cancelled, Rescheduled
- Use for: No-show nurture, post-meeting follow-up

### Form/Survey Triggers

**Form Submitted**
- Fires on form completion
- Use for: Lead capture -> opportunity creation -> speed-to-lead

## Action Types

### Communication Actions

**Send SMS**
- Supports custom values: {{contact.first_name}}, {{contact.phone}}
- Max 160 chars for single segment (avoid splitting)
- Personalization increases reply rate 30%+
- Always include CTA (calendar link, reply prompt)

**Send Email**
- Use templates for consistency
- Custom values work in subject + body
- Track opens/clicks for If/Else branching later

**Voice AI Outbound Call**
- Requires: consent from calendar booking, phone assigned to agent
- Calling window: 10 AM - 6 PM contact timezone (GHL enforced)
- Rate: 1 call/min/location, 100 calls/day/location
- Cannot be directly triggered via API workflow enrollment (use manual Phone Call test UI for immediate calls)

**Voicemail Drop**
- Leaves voicemail without ringing the phone
- Pre-record message in workflow action
- Best paired with SMS sent 2 min after

### Pipeline Actions

**Create Opportunity**
- Set: Pipeline, Stage, Source, Value, Name
- Pattern: "{{contact.first_name}} - {{contact.company_name}}"
- Avoid duplicates: check with If/Else before creating

**Update Opportunity**
- Change: Stage, Status (Open/Won/Lost/Abandoned), Value, Source
- Critical: select correct Pipeline first, then Stage
- Use for automated stage progression

### Flow Control

**Wait**
- Time-based: minutes, hours, days
- Event-based: "Wait for contact reply" (with timeout)
- Pattern: Wait 5 min -> check reply -> branch

**If/Else**
- Conditions: Contact field value, Tag exists, Opportunity stage, Last activity, Custom field
- "Contact Replied" condition: checks if ANY reply received since workflow enrollment
- "Tag Contains" condition: check for specific engagement tags
- Supports AND/OR logic for multi-condition branching

**Go To**
- Jump to another step in same workflow
- Use for loops (retry logic with counter tag)

**End Workflow / Remove from Workflow**
- Stops processing for this contact
- Important: use "Remove from all other workflows" when enrolling in a new sequence to prevent conflicts

### Tagging Actions

**Add Tag / Remove Tag**
- Tags are the cross-workflow communication layer
- Pattern: Add "contacted" tag -> another workflow triggers on "contacted" tag
- Use prefixes: status:, source:, campaign:, niche:

## Workflow Patterns

### Speed-to-Lead (5 Minute Rule)

```
Trigger: Opportunity Created (Pipeline: X, Stage: New Lead)
1. Send SMS: "Hey {{first_name}}, this is Jordan from ClawOps..."
2. Send Email: Value prop + calendar link
3. Add Tag: "speed-to-lead-fired"
4. Wait: 5 minutes
5. If/Else: Contact Replied?
   YES -> Add Tag: "replied", Update Opp to "Engaged"
   NO  -> Send SMS: "Quick follow-up - did you see my message?"
6. Wait: 55 minutes (total 1 hour from lead creation)
7. If/Else: Contact Replied?
   YES -> Add Tag: "replied", Update Opp to "Engaged"
   NO  -> Voice AI Outbound Call
8. Update Opportunity: Stage -> "Contacted"
```

### Multi-Channel Follow-Up

```
Trigger: Opportunity Stage Changed to "Contacted"
1. Wait: 4 hours
2. If/Else: Contact Replied?
   YES -> Update Opp to "Engaged", End
   NO  -> Continue
3. Send SMS: Follow-up with different angle
4. Wait: 20 hours
5. If/Else: Contact Replied?
   YES -> Update Opp to "Engaged", End
   NO  -> Continue
6. Send Email: Case study / social proof
7. Voice AI Outbound Call
8. Wait: 24 hours
9. If/Else: Contact Replied?
   YES -> Update Opp to "Engaged", End
   NO  -> Continue
10. Send SMS: Breakup message
11. Add Tag: "breakup-sent"
12. Wait: 24 hours
13. If/Else: Contact Replied?
    YES -> Update Opp to "Engaged", Remove Tag "breakup-sent", End
    NO  -> Update Opp Stage to "Dead Lead", Add Tag "nurture-drip"
```

### No-Show Recovery

```
Trigger: Appointment Status Changed to "No-Showed"
1. Wait: 10 minutes
2. Send SMS: "Hey {{first_name}}, looks like we missed each other. No worries - here's my calendar to rebook: [link]"
3. Add Tag: "no-show"
4. Wait: 4 hours
5. If/Else: Appointment Rescheduled?
   YES -> Remove Tag "no-show", End
   NO  -> Continue
6. Send SMS: "Still want to chat? I saved your spot - [calendar link]"
7. Wait: 24 hours
8. If/Else: Appointment Rescheduled?
   YES -> Remove Tag "no-show", End
   NO  -> Continue
9. Voice AI Outbound Call
10. Wait: 24 hours
11. Send SMS: Final breakup message
12. Update Opportunity: Stage -> "Dead Lead"
```

### Engagement to Booking Conversion

```
Trigger: Contact Replied + Opportunity in "Engaged" stage
1. Send SMS: "Great to hear from you! Let's get a quick call set up: [calendar link]"
2. Wait: 30 minutes
3. If/Else: Appointment Scheduled?
   YES -> Update Opp to "Demo Booked", End
   NO  -> Continue
4. Send SMS: "Just a heads up - my calendar fills fast. Grab a slot: [link]"
5. Wait: 4 hours
6. If/Else: Appointment Scheduled?
   YES -> Update Opp to "Demo Booked", End
   NO  -> Voice AI Call
7. Wait: 24 hours
8. If/Else: Appointment Scheduled?
   YES -> Update Opp to "Demo Booked", End
   NO  -> Send breakup SMS, move to "Dead Lead"
```

## Custom Values Reference

Use these in SMS/email templates:

| Custom Value | Description |
|-------------|-------------|
| {{contact.first_name}} | Contact first name |
| {{contact.last_name}} | Contact last name |
| {{contact.phone}} | Contact phone |
| {{contact.email}} | Contact email |
| {{contact.company_name}} | Company name |
| {{contact.full_name}} | Full name |
| {{opportunity.name}} | Opportunity name |
| {{opportunity.monetary_value}} | Deal value |
| {{opportunity.pipeline_stage}} | Current stage name |
| {{appointment.start_date}} | Appointment date |
| {{appointment.start_time}} | Appointment time |
| {{location.name}} | Sub-account name |
| {{location.phone}} | Location phone |
| {{user.first_name}} | Assigned user name |
| {{calendar.link}} | Calendar booking URL |

## Workflow Best Practices

1. **One workflow per stage transition.** Don't cram everything into one giant workflow.
2. **Always use If/Else before communication.** Check if contact already replied/booked before sending another message.
3. **Tag everything.** Tags are your audit trail and cross-workflow communication.
4. **Remove from conflicting workflows.** When moving to a new stage, remove from the old stage's workflow first.
5. **Test with a real contact.** GHL test mode doesn't catch everything. Create a test contact and run through the full sequence.
6. **Set workflow enrollment limits.** "Allow re-entry" should be OFF for most sequences to prevent spam.
7. **Watch for timezone issues.** Wait steps use the location timezone unless configured otherwise. Voice AI calling hours use the contact's phone timezone.
