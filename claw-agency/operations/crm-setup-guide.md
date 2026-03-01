# ClawOps - HubSpot CRM Setup Guide

Set up a free HubSpot CRM pipeline to track leads, deals, and clients for ClawOps.

Website: https://rickclaw08.github.io/claw-systems/
Contact: agentclaw08@icloud.com

---

## Step 1: Create a Free HubSpot Account

1. Go to https://app.hubspot.com/signup-hubspot/crm
2. Sign up with agentclaw08@icloud.com
3. Company name: **ClawOps**
4. Select "I'm a solo operator" or "1 employee"
5. Industry: Technology / IT Services
6. Complete onboarding wizard, skip any paid upsells

## Step 2: Configure Company Settings

1. Go to Settings (gear icon, top right)
2. Under **Account Defaults**:
   - Company name: ClawOps
   - Domain: rickclaw08.github.io/claw-systems
   - Time zone: Eastern Time
   - Currency: USD
3. Under **Users & Teams**, confirm your account is set as Super Admin

## Step 3: Create Deal Pipeline

1. Go to Settings > Objects > Deals
2. Click "Pipelines" tab
3. Edit the default "Sales Pipeline" or create a new one named **ClawOps Pipeline**

### Pipeline Stages

| Stage | Win Probability | Description |
|-------|----------------|-------------|
| **New Lead** | 10% | Inbound inquiry or outreach response received |
| **Discovery Call Booked** | 20% | Call scheduled to discuss needs |
| **Discovery Complete** | 30% | Call done, needs understood, scope discussed |
| **Proposal Sent** | 50% | Proposal/quote delivered to prospect |
| **Negotiation** | 70% | Client reviewing, asking questions, negotiating terms |
| **Contract Sent** | 80% | Contract sent for signature |
| **Closed Won** | 100% | Signed and deposit received |
| **Closed Lost** | 0% | Did not convert (track reason) |

4. Click "Save" after adding all stages

## Step 4: Create Deal Properties

1. Go to Settings > Properties > Deal Properties
2. Add custom properties:
   - **Service Type** (dropdown): AI Chatbot, Workflow Automation, Data Pipeline, Custom AI Agent, Consulting, Other
   - **Pricing Tier** (dropdown): Starter ($500), Growth ($2K/mo), Enterprise (Custom)
   - **Lead Source** (dropdown): Website, Referral, Twitter/X, LinkedIn, Cold Outreach, Other
   - **Project Timeline** (text): Expected delivery timeframe

## Step 5: Set Up Contact Properties

1. Go to Settings > Properties > Contact Properties
2. Add:
   - **Company Size** (dropdown): Solo, 2-10, 11-50, 51-200, 200+
   - **Tech Stack** (multi-line text): Current tools they use
   - **Budget Range** (dropdown): Under $1K, $1K-$3K, $3K-$10K, $10K+

## Step 6: Create Saved Views

1. In Deals, create filtered views:
   - **Active Pipeline**: All deals not in Closed Won or Closed Lost
   - **This Week's Follow-ups**: Deals with next activity date this week
   - **Hot Leads**: Deals in Discovery Complete or later with amount > $1K

## Step 7: Set Up Email Integration

1. Go to Settings > General > Email
2. Connect your email (agentclaw08@icloud.com)
3. Enable email tracking and logging
4. Emails to/from contacts will auto-log to their CRM record

## Step 8: Create Email Templates

Save these in HubSpot (Conversations > Templates):

### Template 1: Initial Response
- Subject: ClawOps - Re: Your Inquiry
- Body: Thank you for reaching out. I'd love to learn more about your project. Here's a link to book a quick discovery call: [Cal.com link]. Looking forward to connecting.

### Template 2: Post-Discovery Follow-up
- Subject: ClawOps - Next Steps from Our Call
- Body: Great speaking with you today. Based on our conversation, I'll have a proposal over to you within 48 hours covering [scope summary]. In the meantime, feel free to check out our work at https://rickclaw08.github.io/claw-systems/

### Template 3: Proposal Follow-up (3 days)
- Subject: Checking In - ClawOps Proposal
- Body: Just wanted to follow up on the proposal I sent over. Happy to hop on a quick call if you have any questions or want to adjust the scope. Let me know.

## Step 9: Set Up Tasks and Reminders

1. For every deal, create follow-up tasks:
   - After Discovery Call: "Send proposal within 48h"
   - After Proposal Sent: "Follow up in 3 days"
   - After Contract Sent: "Check for signature in 2 days"
2. Use HubSpot's task queue to work through follow-ups daily

## Step 10: Dashboard Setup

1. Go to Reports > Dashboards
2. Create "ClawOps Sales Dashboard" with:
   - Deal pipeline by stage (funnel chart)
   - Revenue forecast (deals weighted by probability)
   - Deals closed this month (number + value)
   - Average deal size
   - Lead source breakdown

---

## Daily CRM Routine

1. **Morning (5 min)**: Check task queue, complete follow-ups
2. **After every call**: Update deal stage, add notes, create next task
3. **Friday (10 min)**: Review pipeline, update forecasts, clean stale deals

## Deal Naming Convention

Format: `[Company] - [Service] - [Month Year]`
Example: `Acme Corp - AI Chatbot - Feb 2026`

## ClawOps Pricing Reference

| Tier | Price | Includes |
|------|-------|----------|
| Starter | $500 | One-time project or setup |
| Growth | $2,000/mo | Ongoing development and support |
| Enterprise | Custom | Large-scale, multi-system projects |
