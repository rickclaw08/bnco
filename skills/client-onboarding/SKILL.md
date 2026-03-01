# Client Onboarding

- **Name:** client-onboarding
- **Version:** 0.1.0
- **Owner:** Harper (COO)
- **Description:** Onboard new clients from signed deal to project kickoff within 48 hours. Covers welcome communication, kickoff scheduling, workspace setup, timeline creation, and resource assignment.

## Trigger Keywords

- "new client"
- "onboard"
- "kickoff"
- "client signed"
- "new deal"
- "welcome client"
- "start onboarding"

## Prerequisites

- Signed contract or deal confirmation
- Client contact information (name, email, company)
- Project scope summary from sales handoff
- references/welcome-email-template.md
- references/kickoff-agenda.md
- references/project-timeline-templates.md

## Workflow

### Step 1: Receive and Confirm the Deal

1. Confirm the deal details:
   - Client name and company
   - Primary contact and their email
   - Project type and scope summary
   - Contract value and payment terms
   - Start date and any hard deadlines
   - Any special requirements or constraints
2. Log the new client in today's memory file:
   ```
   ## New Client Onboarding
   - Client: [Company Name]
   - Contact: [Name] ([email])
   - Project: [Brief description]
   - Value: [Contract value]
   - Signed: [Date]
   - Target kickoff: [Date, within 48 hours]
   ```
3. Set the 48-hour countdown. Kickoff must happen within 48 hours of signing

### Step 2: Send Welcome Email

1. Load references/welcome-email-template.md
2. Customize the template with:
   - Client name and company
   - Project name
   - Your name and role as their point of contact
   - What they can expect in the first week
   - Kickoff meeting scheduling link or proposed times
   - Any pre-kickoff homework (access credentials, existing docs, etc.)
3. Review for brand voice compliance (no em dashes, direct tone)
4. Send the welcome email
5. Log the send time

### Step 3: Schedule Kickoff Meeting

1. Propose 2-3 time slots within the next 48 hours
2. Use the scheduling tool or email to coordinate
3. Target meeting length: 60 minutes
4. Send calendar invite with:
   - Meeting title: "[Company Name] x ClawOps - Project Kickoff"
   - Agenda (from references/kickoff-agenda.md)
   - Video call link
   - Attendees: client team + ClawOps project team
5. Confirm attendance from all required participants

### Step 4: Set Up Communication Channel

1. Create a dedicated Slack channel (or preferred platform):
   - Channel name: `client-[company-name]`
   - Add client contacts
   - Add ClawOps project team members
   - Post welcome message with key links and contacts
2. If client prefers email-only, set up an email thread with clear subject line conventions:
   - Format: `[CompanyName] - [Topic] - [Date]`
3. Share communication preferences and response time expectations:
   - Business hours response: within 4 hours
   - Urgent issues: within 1 hour
   - Weekly status updates every [agreed day]

### Step 5: Create Project Timeline

1. Load references/project-timeline-templates.md
2. Select the appropriate template based on project type
3. Customize the timeline:
   - Phase 1: Discovery and requirements (Week 1)
   - Phase 2: Design and architecture (Week 2-3)
   - Phase 3: Build and iterate (Week 3-6, varies)
   - Phase 4: Testing and QA (Week 6-7)
   - Phase 5: Launch and handoff (Week 7-8)
4. Adjust dates based on:
   - Contract start date
   - Client availability
   - Hard deadlines
   - Resource availability
5. Share the draft timeline with the client for feedback

### Step 6: Assign Resources

1. Review the project requirements
2. Identify needed roles:
   - Project lead
   - Technical lead
   - Developers/builders
   - QA reviewer
3. Check team availability and current workload
4. Assign team members and notify them:
   - Project summary
   - Their role and responsibilities
   - Timeline and key dates
   - Client communication channel
5. Ensure no one is overallocated (check capacity model)

### Step 7: Prepare Kickoff Materials

1. Create a kickoff deck or document covering:
   - Team introductions
   - Project scope recap
   - Timeline overview
   - Communication plan
   - Next steps and immediate action items
   - Questions for the client
2. Load references/kickoff-agenda.md and finalize the agenda
3. Prepare any discovery questions needed
4. Share pre-read materials with attendees 24 hours before kickoff

### Step 8: Run Kickoff Meeting

1. Follow the kickoff agenda from references/kickoff-agenda.md
2. Key meeting goals:
   - Align on scope, timeline, and success criteria
   - Establish communication cadence
   - Identify risks and dependencies
   - Define immediate next steps with owners and deadlines
   - Answer client questions
3. Take detailed meeting notes
4. Share meeting notes and action items within 2 hours of meeting end

### Step 9: Post-Kickoff Checklist

Within 24 hours of kickoff:
- [ ] Meeting notes shared with all attendees
- [ ] Action items assigned with deadlines
- [ ] Project timeline finalized and shared
- [ ] Communication channel active with all members
- [ ] First status update scheduled
- [ ] Any pre-work or access requests initiated
- [ ] Client has all ClawOps contact information
- [ ] Internal team briefed and aligned

### Step 10: Transition to Active Project

1. Hand off to project-delivery skill for ongoing management
2. Schedule the first status update (see references/status-update-template.md)
3. Set up recurring meetings if agreed upon
4. Update the client roster / active projects list
5. Log the completed onboarding in memory

## Onboarding SLA

- Welcome email: within 4 hours of deal confirmation
- Kickoff scheduled: within 24 hours
- Kickoff completed: within 48 hours
- All channels and docs set up: within 48 hours
- First status update: within 1 week of kickoff

## Escalation

If any SLA is at risk:
1. Notify the team lead immediately
2. Communicate proactively with the client
3. Provide a revised timeline with explanation
4. Never let a client wonder what is happening

## Reference Files

| File | Purpose |
|------|---------|
| references/welcome-email-template.md | Welcome email template for new clients |
| references/kickoff-agenda.md | Standard kickoff meeting agenda |
| references/project-timeline-templates.md | Timeline templates by project type |
| references/status-update-template.md | Weekly status update format |
