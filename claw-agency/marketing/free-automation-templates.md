# Free Automation Templates - ClawOps

> 5 ready-to-use automation templates for common small business workflows.
> Each template saves 5-15 hours/week and costs under $50/month to run.

---

## Template 1: Smart Lead Capture and Routing

### The Problem It Solves
Leads come in from your website form, and then... nothing happens for hours. Someone has to check the inbox, copy the info into your CRM, assign it to the right salesperson, and send a confirmation email. By the time all that happens, the lead has already called your competitor.

Studies show that responding within 5 minutes makes you 21x more likely to qualify a lead compared to responding after 30 minutes. Most small businesses respond in 4-6 hours.

### What This Template Does
Captures form submissions instantly, creates a CRM contact, routes the lead to the right team member based on rules you set (geography, product interest, deal size), sends a personalized confirmation email within 60 seconds, and notifies the assigned rep via Slack or SMS.

### Tools Required
- **n8n** (free self-hosted or $20/month cloud) - workflow engine
- **Typeform or Google Forms** (free) - lead capture form
- **HubSpot CRM Free or Google Sheets** - contact database
- **Gmail or SendGrid** ($0-15/month) - email sending
- **Slack** (free) or **Twilio SMS** ($0.0079/message) - notifications

**Total monthly cost: $0-35**

### Estimated Time Savings
- **Before:** 45-90 minutes/day manually processing and routing leads
- **After:** 0 minutes (fully automated)
- **Weekly savings:** 4-8 hours
- **Annual value at $25/hour:** $5,200-10,400

### Setup Guide (30-Minute Build)

**Step 1: Create your lead form (5 minutes)**
Set up a Typeform or Google Form with fields for: name, email, phone, company, what they need help with, and budget range. Connect a webhook to fire on each submission.

**Step 2: Build the n8n workflow (15 minutes)**
- Add a Webhook trigger node (receives form data)
- Add an IF node for routing logic (e.g., "if budget > $5,000, assign to senior rep; otherwise assign to junior rep")
- Add a CRM node (HubSpot or Google Sheets) to create/update the contact record
- Add an Email node to send the confirmation (use a template with merge fields for personalization)
- Add a Slack/SMS node to notify the assigned rep with lead details

**Step 3: Write your confirmation email template (5 minutes)**
Keep it short: "Hi [Name], thanks for reaching out about [their need]. [Assigned rep name] will be in touch within [timeframe]. In the meantime, here's [relevant resource link]."

**Step 4: Test with 3-5 dummy submissions (5 minutes)**
Submit the form yourself with different scenarios to verify routing logic, CRM entries, and email delivery all work correctly.

---

## Template 2: Automated Invoice Processing Pipeline

### The Problem It Solves
Invoices arrive via email as PDF attachments. Someone opens each one, reads the vendor name, invoice number, amounts, and line items, then manually types all of that into your accounting software. For a business processing 50-200 invoices per month, this eats 10-20 hours of someone's time and introduces a 5-8% error rate from typos and missed entries.

### What This Template Does
Watches your invoices inbox for new emails with PDF attachments. Extracts all relevant data from the PDF using AI document parsing. Validates the data against your vendor list. Creates the bill in your accounting software (QuickBooks or Xero). Files the original PDF in organized cloud storage. Sends a summary notification so your bookkeeper can review without doing data entry.

### Tools Required
- **n8n** (free self-hosted or $20/month cloud) - workflow engine
- **Google Document AI** ($1.50 per 1,000 pages) or **AWS Textract** (similar pricing) - PDF data extraction
- **QuickBooks Online or Xero** (existing subscription) - accounting software
- **Google Drive or Dropbox** (free tier works) - PDF filing
- **Slack or Email** (free) - notifications

**Total monthly cost: $20-25** (for a business processing 100-200 invoices/month)

### Estimated Time Savings
- **Before:** 8-12 minutes per invoice manually
- **After:** 30 seconds per invoice (automated processing + human spot-check)
- **Weekly savings:** 8-15 hours (at 50+ invoices/week)
- **Annual value at $30/hour:** $12,480-23,400

### Setup Guide (2-3 Hour Build)

**Step 1: Set up the email trigger (10 minutes)**
In n8n, create an IMAP trigger that watches your invoices@ email address (or a specific Gmail label). Filter for emails with PDF attachments.

**Step 2: Configure document parsing (30 minutes)**
Create a Google Document AI processor (use the "Invoice Parser" pre-trained model). In your n8n workflow, add a node that sends the PDF attachment to Document AI and receives back structured data: vendor name, invoice number, date, line items, tax, total.

**Step 3: Build validation logic (30 minutes)**
Add a Google Sheets node that checks the extracted vendor name against your approved vendor list. If the vendor matches, proceed. If not, route to a "needs review" notification. Also check for duplicate invoice numbers to prevent double-entry.

**Step 4: Connect to accounting software (30 minutes)**
Add a QuickBooks or Xero node. Map the extracted fields to the bill creation endpoint: vendor, date, due date, line items with amounts and categories. Use your existing chart of accounts for category mapping.

**Step 5: Set up filing and notifications (20 minutes)**
Add a Google Drive node that renames the PDF (format: VENDOR-INVOICENUMBER-DATE.pdf) and saves it to the appropriate folder. Add a Slack/email notification with a summary: "Processed: [Vendor] - $[Total] - Invoice #[Number]."

**Step 6: Test with 10 real invoices (30 minutes)**
Run 10 actual invoices through the system. Check extraction accuracy, accounting entries, and filing. Adjust category mappings and validation rules as needed.

---

## Template 3: Email Follow-Up Sequencer

### The Problem It Solves
You send a proposal, a quote, or an introduction email. Then you forget to follow up. Or you follow up once and give up. Research shows it takes an average of 5 touchpoints to convert a prospect, but 44% of salespeople give up after one follow-up. Leads go cold not because they're uninterested, but because nobody stayed in touch.

### What This Template Does
Tracks outbound emails you flag for follow-up. Automatically sends personalized follow-up emails on a schedule you define (e.g., Day 3, Day 7, Day 14, Day 21). Stops the sequence immediately when the recipient replies. Logs all activity to a tracking sheet so you can see your pipeline at a glance. Sends you a daily summary of active sequences and replies received.

### Tools Required
- **n8n** (free self-hosted or $20/month cloud) - workflow engine
- **Gmail** (free or Workspace) - email sending/monitoring
- **Google Sheets** (free) - sequence tracking and pipeline dashboard
- **Slack** (free) - daily summary notifications

**Total monthly cost: $0-20**

### Estimated Time Savings
- **Before:** 30-60 minutes/day manually tracking who needs follow-up and writing emails
- **After:** 5 minutes/day reviewing the daily summary
- **Weekly savings:** 3-5 hours
- **Annual value at $35/hour:** $5,460-9,100
- **Revenue impact:** Businesses that follow up consistently report 25-40% higher close rates

### Setup Guide (1-Hour Build)

**Step 1: Create your tracking spreadsheet (10 minutes)**
Set up a Google Sheet with columns: Recipient Email, Recipient Name, Company, Subject, Date Sent, Follow-Up Stage (1-5), Next Follow-Up Date, Status (Active/Replied/Closed), Notes.

**Step 2: Build the trigger mechanism (10 minutes)**
Option A (simple): Manually add rows to the spreadsheet when you send an important email. Option B (advanced): Use a Gmail label. When you label an email "Follow-Up," n8n detects it and adds it to the tracker automatically.

**Step 3: Write your follow-up templates (15 minutes)**
Create 4-5 follow-up email templates with increasing urgency:
- Follow-up 1 (Day 3): Gentle check-in. "Just wanted to make sure this didn't get buried."
- Follow-up 2 (Day 7): Add value. Share a relevant resource or case study.
- Follow-up 3 (Day 14): Direct ask. "Is this still a priority for your team?"
- Follow-up 4 (Day 21): Breakup email. "I'll assume the timing isn't right. Feel free to reach out when it is."

**Step 4: Build the n8n workflow (20 minutes)**
- Scheduled trigger: runs daily at 8am
- Google Sheets node: reads all rows where Next Follow-Up Date = today AND Status = Active
- Gmail node: checks if the recipient has replied (search for emails from that address after the original send date). If replied, update Status to "Replied" and stop.
- If no reply: send the next follow-up template via Gmail, update Follow-Up Stage and Next Follow-Up Date
- Slack node: send daily summary of actions taken

**Step 5: Test the full cycle (5 minutes)**
Add yourself as a test recipient. Verify each follow-up fires on schedule and that a reply correctly stops the sequence.

---

## Template 4: Social Media Auto-Posting System

### The Problem It Solves
You know you should post consistently on social media. But creating posts, formatting them for each platform, scheduling them, and actually hitting "publish" across 2-3 platforms takes 5-8 hours per week. So you post sporadically, your engagement drops, and your social presence becomes an afterthought.

### What This Template Does
Takes a batch of content ideas (from a simple spreadsheet), generates platform-specific post variations, schedules them across Instagram, LinkedIn, and Twitter/X on optimal posting days and times, and tracks performance metrics back to your spreadsheet. You spend 1 hour per week on content ideas; the system handles everything else.

### Tools Required
- **n8n** (free self-hosted or $20/month cloud) - workflow engine
- **Google Sheets** (free) - content calendar and idea bank
- **OpenAI API** ($2-5/month) - generating post variations from your content briefs
- **Buffer** (free tier: 3 channels, 10 posts/channel) or **Typefully** (free tier for Twitter) - social scheduling
- **Canva API or pre-made templates** (free) - image assets

**Total monthly cost: $2-25** (depending on posting volume and tools selected)

### Estimated Time Savings
- **Before:** 5-8 hours/week on content creation, formatting, and manual posting
- **After:** 1 hour/week brainstorming content ideas and reviewing generated posts
- **Weekly savings:** 4-7 hours
- **Annual value at $25/hour:** $5,200-9,100

### Setup Guide (1.5-Hour Build)

**Step 1: Set up your content calendar spreadsheet (15 minutes)**
Create a Google Sheet with columns: Content Topic, Key Message, Target Platform(s), Desired Tone, Image Description, Scheduled Date, Status (Draft/Approved/Posted), Performance Notes.

**Step 2: Configure AI content generation (20 minutes)**
In n8n, add an OpenAI node with a prompt template: "Write a [platform] post about [topic]. Key message: [message]. Tone: [tone]. Keep it under [character limit]. Include a call to action." Create separate prompt variations for LinkedIn (professional, 1300 chars), Twitter/X (conversational, 280 chars), and Instagram (casual, with hashtag suggestions).

**Step 3: Connect to scheduling tools (20 minutes)**
Add Buffer or platform-specific API nodes. Map the generated content to the right platform queue. Set posting times based on your audience's peak engagement hours (typically 9-11am and 1-3pm on weekdays for B2B).

**Step 4: Build the weekly batch workflow (20 minutes)**
- Trigger: runs every Monday at 7am (or whenever you complete your weekly content ideas)
- Reads new content ideas from Google Sheets (rows with Status = "Draft")
- Generates post variations for each platform
- Writes drafts back to the spreadsheet for your review
- After you mark rows as "Approved," a second workflow pushes them to Buffer for scheduling

**Step 5: Add performance tracking (15 minutes)**
Set up a weekly workflow that pulls engagement metrics from each platform's API (likes, comments, shares, clicks) and writes them back to your spreadsheet. Over time, you'll see which topics and formats perform best.

---

## Template 5: Weekly Business Report Generator

### The Problem It Solves
Every Monday (or Friday), someone spends 3-8 hours pulling data from multiple tools (CRM, accounting software, project management, email, analytics), copying it into a report template, calculating KPIs, creating charts, and emailing it to the team. It's the same process every week, and it's pure waste of a skilled person's time.

### What This Template Does
Automatically pulls data from your business tools at a scheduled time. Calculates your key performance indicators. Generates a formatted report with charts and trend comparisons. Writes a brief AI-powered executive summary highlighting what went well, what needs attention, and what changed from last week. Emails the finished report to your team before they arrive Monday morning.

### Tools Required
- **n8n** (free self-hosted or $20/month cloud) - workflow engine
- **Google Sheets** (free) - data aggregation and chart generation
- **Google Slides or Google Docs** (free) - report template
- **OpenAI API** (~$0.10-0.50 per report) - executive summary generation
- **API connections to your tools** - varies (CRM, accounting, PM tool, analytics)

**Total monthly cost: $20-25**

### Estimated Time Savings
- **Before:** 3-8 hours every week building the same report
- **After:** 0 hours (fully automated, report ready by 6am)
- **Weekly savings:** 3-8 hours
- **Annual value at $40/hour:** $6,240-16,640

### Setup Guide (2-3 Hour Build)

**Step 1: Define your KPIs and data sources (20 minutes)**
List the 8-12 metrics that matter most to your business. For each one, identify which tool holds the data and whether it has an API. Common combos:
- Revenue/sales data: QuickBooks, Stripe, or your CRM
- Pipeline/leads: HubSpot, Salesforce, or Pipedrive
- Project status: Asana, Monday.com, or ClickUp
- Website traffic: Google Analytics
- Support metrics: Zendesk, Intercom, or Help Scout

**Step 2: Build data collection nodes (45 minutes)**
In n8n, create API nodes for each data source. Pull last week's data (use date filters for the prior Monday-Sunday). Store raw data in a Google Sheet tab called "Raw Data." Run all API calls in parallel to keep the workflow fast.

**Step 3: Create the calculation layer (30 minutes)**
Add a JavaScript/code node that calculates your KPIs from the raw data. Include week-over-week comparisons (pull prior week's data from a "Historical" tab for comparison). Output a clean data object with each KPI, its current value, prior value, and percent change.

**Step 4: Generate the report (30 minutes)**
Use Google Sheets chart features to auto-generate visuals from the KPI data. Then use the Google Slides API to inject data and charts into a pre-designed template. Alternatively, generate a clean HTML email with inline charts using a charting library.

**Step 5: Add the AI summary (15 minutes)**
Pass your KPI data to OpenAI with a prompt: "You are a business analyst. Summarize this week's performance data in 3 paragraphs: (1) wins and positive trends, (2) areas of concern, (3) recommended actions. Be specific with numbers. No fluff." Inject the summary into the top of your report.

**Step 6: Schedule and distribute (10 minutes)**
Set the workflow trigger to 5:00am every Monday. Add an email node that sends the finished report (PDF attachment + summary in the email body) to your distribution list. Add error handling: if any API call fails, send a notification instead of a broken report.

---

## How to Get Started

Pick the template that addresses your biggest time sink. Most businesses should start with Template 1 (Lead Capture) or Template 3 (Email Follow-Up) because they directly impact revenue.

If you want help building any of these for your specific tools and workflow, reach out at [theclawops.com](https://theclawops.com). We'll map your exact setup and have it running within a week.

---

*All templates designed for n8n (open-source workflow automation). Most can be adapted to Make.com or Zapier with minor modifications. Time savings estimates based on real client implementations.*
