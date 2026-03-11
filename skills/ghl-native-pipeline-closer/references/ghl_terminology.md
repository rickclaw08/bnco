# GHL Terminology Glossary

Quick reference for GoHighLevel-specific terms. Use correct terminology when building automations, talking to GHL support, or configuring the platform.

## Core Concepts

**Sub-Account (Location)**
A single business account within GHL. Each sub-account has its own contacts, pipelines, workflows, phone numbers, and settings. One GHL agency account can manage many sub-accounts.
- Location ID: unique identifier (e.g., "Ez2ADxydpjvWsW3suYiq")
- Each location has its own billing, phone numbers, and data

**Agency Account**
The parent account that manages multiple sub-accounts. Used by agencies selling GHL-powered services to clients.

**Snapshot**
A full backup/template of a sub-account's configuration: workflows, pipelines, funnels, calendars, automations, templates. Snapshots can be loaded into new sub-accounts to replicate an entire setup instantly. Think of it as "cloning a business setup."

**SaaS Mode**
Selling GHL as a white-labeled product to clients. They get their own sub-account, you bill them monthly.

## Pipeline & Opportunities

**Pipeline**
A visual sales process with ordered stages. Each pipeline represents one sales flow (e.g., "Voice AI Leads," "Founding Members," "Enterprise Deals").

**Stage**
A step within a pipeline. Opportunities move through stages as they progress.
- Standard stages: New Lead -> Contacted -> Engaged -> Demo Booked -> Closed Won
- Custom stages allowed, no limit
- Each stage has a unique ID used in workflow triggers

**Opportunity**
A deal/lead tracked within a pipeline. Tied to a contact. Has properties:
- Name, Value (monetary), Stage, Status, Source, Assigned User
- Status values: Open, Won, Lost, Abandoned

**Opportunity Source**
Free-text field describing where the lead came from. Examples: "Voice AI Outbound Call," "Website Form," "Referral"

## Contacts

**Contact**
A person in the CRM. Core fields: first name, last name, email, phone, company, tags.
- Unique by phone OR email within a sub-account
- Can have multiple opportunities across different pipelines

**Custom Fields**
User-defined fields on contacts. Types: text, number, dropdown, checkbox, date, textarea.
- Created in Settings > Custom Fields
- Referenced in workflows via custom value tokens
- Example: "Trade Niche" dropdown with HVAC, Plumbing, Electrical, etc.

**Tags**
Labels attached to contacts for segmentation and workflow triggering.
- No hierarchy, flat namespace
- Best practice: use prefixes (niche:hvac, status:new-lead, source:lead-sheet, campaign:founding-wave1)
- Tags trigger workflows, filter Smart Lists, and segment contacts

**DND (Do Not Disturb)**
Contact-level opt-out setting. When enabled, GHL blocks all automated communication.
- Set when contact texts "STOP" or requests opt-out
- Applies per channel: SMS DND, Email DND, Voice DND, etc.
- Workflows should check DND before sending

**Smart Lists**
Saved contact filters. Combine tag, field, activity, and date conditions.
- Use for: "Leads not contacted in 48h," "No-shows this week," "Hot leads with no booking"
- Can trigger bulk workflow enrollment
- Update in real-time as contacts match/unmatch filters

## Workflows

**Workflow**
An automation sequence: trigger -> actions -> conditions -> more actions.
- Triggers: what starts the workflow (event-based)
- Actions: what the workflow does (send SMS, email, move opp, etc.)
- Conditions: If/Else branching logic

**Trigger**
The event that starts a workflow. Types:
- Contact: created, replied, tag added/removed, DND
- Opportunity: created, stage changed, status changed
- Appointment: scheduled, status changed (confirmed/showed/no-showed/cancelled)
- Form/Survey: submitted
- Custom: webhook, date-based, manual enrollment

**Action**
A step in a workflow. Types:
- Communication: SMS, Email, Voice AI Call, Voicemail Drop, Facebook/IG DM
- CRM: Add/Remove Tag, Create/Update Opportunity, Update Contact Field, Create Task
- Flow: Wait (time/event), If/Else, Go To, End, Remove from Workflow
- External: Webhook (outbound), Custom Code (JS)

**If/Else (Conditional)**
Branching logic within workflows. Conditions:
- Contact field equals/contains value
- Tag exists/doesn't exist
- Opportunity stage equals X
- Contact replied (since enrollment)
- Appointment exists with status X
- Supports AND/OR combinations

**Wait Step**
Pauses workflow execution. Two types:
- Time-based: wait X minutes/hours/days
- Event-based: wait for contact reply (with timeout)

**Enrollment**
When a contact enters a workflow. Settings:
- Allow re-entry: ON/OFF (whether same contact can enter again)
- Remove from other workflows: option to prevent conflicts

## Phone & Communication

**Phone Number**
Purchased through GHL (LC Phone). Types:
- Local: area-code specific, better pickup rates
- Toll-Free: 1-800/888, requires verification
- Each number can be assigned to Voice AI agents

**LC Phone (Lead Connector Phone)**
GHL's built-in phone system powered by Twilio/Bandwidth.

**A2P (Application-to-Person)**
SMS regulatory framework. Requires brand registration and campaign approval.
- Brand Registration: company info submitted to carriers
- Campaign: specific use case (e.g., "marketing," "appointment reminders")
- Both must be approved for SMS delivery

**Trust Center**
GHL's compliance dashboard. Tracks:
- CNAM Registration (caller ID name display)
- SHAKEN/STIR (call authentication)
- Voice Integrity (spam reputation)
- A2P Brand + Campaign (SMS compliance)
- All must be approved for full functionality

**Voice AI Agent**
GHL's native AI-powered phone system. Features:
- Inbound: answers calls with custom prompt
- Outbound: places calls to contacts via workflow or manual trigger
- Custom voice selection, LLM model (GPT 4o, 5.1, etc.)
- Actions: book appointment, transfer call, end call
- Consent required for outbound (calendar booking with checkbox)
- Disclosure: must disclose AI nature of call

**Voicemail Drop (Ringless Voicemail)**
Leave a pre-recorded voicemail in contact's inbox without their phone ringing. Available as workflow action.

## Calendar

**Calendar**
Native scheduling tool. Features:
- Round-robin or specific user assignment
- Availability windows (days, hours)
- Buffer time between appointments
- Consent checkbox (required for Voice AI outbound)
- Custom booking widget for embedding in links/pages

**Appointment**
A scheduled calendar event. Statuses:
- Confirmed: booked and upcoming
- Showed: attended
- No-Showed: missed
- Cancelled: cancelled by contact or user
- Rescheduled: moved to new time

## Funnels & Websites

**Funnel**
Landing page builder. Multi-step pages for lead capture. Each step can have forms, videos, testimonials.

**Website**
Full website builder within GHL. Pages, blog, navigation.

## Reporting

**Dashboard**
Overview of pipeline, appointments, calls, revenue.

**Attribution Report**
Shows which sources drive leads and revenue.

**Conversation AI Report**
Tracks Voice AI call outcomes, duration, sentiment.
