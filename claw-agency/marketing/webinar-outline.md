# Free Automation Workshop - Webinar Outline

---

## Title

**"Build Your First Business Automation in 30 Minutes (Live): Eliminate 10 Hours/Week of Manual Work Starting Today"**

**Subtitle:** A hands-on workshop where we build a real, working automation from scratch. No coding. No fluff. You'll walk out with something you can use tomorrow.

---

## Format

- **Duration:** 30 minutes (25 min content + 5 min Q&A)
- **Style:** Live screen-share build, not slides. Attendees watch a real automation get built in real time.
- **Platform:** Zoom (free tier supports 100 attendees, 40-min limit is fine for 30-min session)
- **Recording:** Yes, replay sent to all registrants (captures no-shows for follow-up)

---

## Target Audience

Small business owners and operations managers who:
- Spend 5-15 hours/week on repetitive admin tasks
- Have heard about automation but haven't tried it
- Don't have a technical background (no coding assumed)
- Run businesses doing $200K-$5M/year with 2-25 employees

---

## The Automation We'll Build Live

**Lead Capture to CRM to Instant Follow-Up**

When someone fills out a contact form on your website:
1. Their info automatically goes into your CRM (or Google Sheets)
2. They get a personalized confirmation email within 60 seconds
3. The right person on your team gets a Slack/SMS notification with the lead's details
4. If nobody follows up within 2 hours, an escalation alert fires

**Why this one:** It's simple enough to build in 15 minutes live. It solves a universal problem (slow lead response). It has clear, measurable ROI ($0 to build, 21x better lead qualification from fast response). And it gives attendees immediate value they can replicate.

---

## Agenda

### Opening (0:00 - 3:00) - The $47,000 Problem

**Key talking points:**
- "The average small business spends $47,000/year on tasks that can be automated for under $50/month. Today I'm going to show you exactly how."
- Quick stat: businesses that respond to leads within 5 minutes are 21x more likely to qualify them vs. responding after 30 minutes. Most small businesses respond in 4-6 hours.
- "In the next 25 minutes, I'm going to build a system that responds to every lead in under 60 seconds, assigns them to the right person, and follows up automatically. Live. From scratch. No code."
- Brief intro: "I'm Rick from ClawOps. We build automation systems for small businesses. Today I'm giving away one of our most popular builds for free."

### The Before (3:00 - 5:00) - Show the Pain

**Key talking points:**
- Walk through the manual process: lead comes in via email, sits in inbox for 2-6 hours, someone copies info to a spreadsheet, types a reply, maybe forgets to tell the sales rep.
- "Raise your hand if this sounds familiar." (Zoom poll or chat engagement)
- Share the real data: 23% of leads at one client we worked with got ZERO follow-up. Not because the team was lazy, but because leads come in at 9pm, during meetings, on weekends.
- "This is the kind of work that doesn't need a human. It needs a system."

### The Build (5:00 - 22:00) - Live Automation Construction

**Step 1: Set up the form (5:00 - 7:00)**
- Open Google Forms (free, everyone has access)
- Create a simple lead form: Name, Email, Phone, "What do you need help with?", Budget Range
- Talk through why each field matters while building
- "This takes 2 minutes. Your current contact form probably already has these fields."

**Step 2: Connect the webhook (7:00 - 9:00)**
- Open n8n (show the interface, explain it's free and open-source)
- Create a new workflow
- Add a Webhook trigger node
- Copy the webhook URL into Google Forms (via Apps Script or a connector)
- Submit a test form entry, show the data flowing in live
- "This is the moment where your form starts talking to your automation. Every submission from now on triggers what we build next."

**Step 3: Add to CRM / Google Sheets (9:00 - 11:00)**
- Add a Google Sheets node
- Map form fields to spreadsheet columns (Name, Email, Phone, Need, Budget, Date Submitted, Assigned To, Status)
- Test it: submit the form, watch the row appear in real time
- "You now have an automatic lead database. No more copy-pasting from email."

**Step 4: Send instant confirmation email (11:00 - 14:00)**
- Add a Gmail node (or SendGrid for higher volume)
- Write a quick confirmation template: "Hi {{name}}, thanks for reaching out about {{need}}. We'll be in touch within the hour."
- Show merge fields pulling from the form data
- Test: submit form, show the email arriving in under 30 seconds
- "Your leads now get a response faster than any human could type one. And it's personalized."

**Step 5: Notify the team (14:00 - 17:00)**
- Add a Slack node (or show SMS via Twilio as an alternative)
- Format the notification: "New Lead: {{name}} from {{company}} - Budget: {{budget}} - Needs: {{need}}"
- Add simple routing logic (IF node): "If budget > $5,000, notify senior rep. Otherwise, notify general sales channel."
- Test: submit two forms with different budgets, show different notifications going to different channels
- "Your team knows about every lead within a minute. No more leads falling through cracks."

**Step 6: Add the escalation (17:00 - 20:00)**
- Add a Wait node (set to 2 hours)
- Add a Check node: look at the Google Sheet row, has the Status been updated from "New" to "Contacted"?
- If not: send an escalation Slack message to the team lead: "ALERT: Lead {{name}} has not been contacted in 2 hours."
- "This is the accountability layer. The system doesn't just capture leads, it makes sure someone actually follows up."

**Step 7: Activate and review (20:00 - 22:00)**
- Toggle the workflow to Active
- Do one final end-to-end test with the audience watching
- Show the complete flow: form submission, spreadsheet entry, confirmation email, Slack notification - all happening in under 30 seconds
- "That's it. You just watched a complete lead management system get built from zero. Total cost: $0. Time to build: 17 minutes."

### The ROI Math (22:00 - 24:00) - Make It Real

**Key talking points:**
- "Let's do the math on what you just saw."
- If you get 30 leads/month and this system saves 5 minutes per lead in manual processing: 2.5 hours/month saved on data entry alone
- But the real ROI is in response time: improving response from 4 hours to 60 seconds can double your conversion rate
- At 30 leads/month with a 10% conversion rate vs. 20%: that's 3 extra customers per month
- "If your average customer is worth $2,000, this free automation just generated $6,000/month in additional revenue. From a system that costs nothing to run."

### What Else Can You Automate? (24:00 - 26:00) - Expand the Vision

**Key talking points:**
- Quick-fire list of other automations using the same tools:
  - Invoice processing (save 10-15 hours/week)
  - Email follow-up sequences (increase close rates 25-40%)
  - Weekly reporting (save 3-8 hours every Monday)
  - Social media scheduling (save 4-7 hours/week)
  - Customer onboarding emails (reduce churn 15-20%)
- "Everything I just listed follows the same pattern: trigger, process, action, notification. Once you understand that pattern, you can automate almost anything."
- "We have free templates for all five of these on our website."

### CTA and Close (26:00 - 28:00)

**Primary CTA: Free Automation Audit**
- "If you want to know exactly which workflows in YOUR business can be automated and how much you'd save, we do free automation audits."
- "It takes 5 minutes to fill out the form. We'll send you a custom report showing your top 3 automation opportunities with estimated time and money savings."
- "No sales pitch. No commitment. Just a clear picture of what automation can do for your specific business."
- Drop the link in chat: theclawops.com/audit

**Secondary CTA: Free Templates**
- "If you want to build today's automation yourself, we have step-by-step template guides for this and 4 other common workflows."
- Drop the link: theclawops.com/templates

**Tertiary CTA: Follow-Up Call**
- "If you saw something today and thought 'I need this but I don't want to build it myself,' book a 15-minute call and we'll scope it out."
- Drop Calendly link in chat

### Q&A (28:00 - 30:00)

**Anticipated questions to prep for:**
- "Does this work with [specific CRM]?" - Yes, n8n connects to 400+ tools. If it has an API, we can connect it.
- "How much does n8n cost?" - Free self-hosted, or $20/month for cloud. Either way, less than one hour of minimum wage labor.
- "What if my form tool isn't Google Forms?" - Works with Typeform, Jotform, Webflow, WordPress, anything that supports webhooks.
- "Can I use this for [specific use case]?" - Probably yes. Take the audit and we'll confirm.
- "Do I need to know how to code?" - No. Everything I built today was drag-and-drop. Zero code.

---

## Pre-Webinar Promotion Plan

**Registration page copy:**
- Headline: "Free Workshop: Build a Lead Response System That Works 24/7 (in 30 Minutes, Live)"
- Subhead: "Watch us build a real automation from scratch. No slides. No theory. Just a working system you can copy."
- Bullet points:
  - Respond to every lead in under 60 seconds (automatically)
  - Never lose a lead to a missed email again
  - Save 5-10 hours/week on manual follow-up
  - Free tools only, $0/month to run
  - Walk away with a system you can replicate today

**Promotion channels:**
- Reddit posts in r/smallbusiness and r/Entrepreneur (value-first framing, not "join our webinar" spam)
- Cold email to existing prospect list (position as free resource, not sales event)
- Instagram story/post with countdown
- Cross-post registration link in relevant Reddit comments when answering automation questions

---

## Post-Webinar Follow-Up Sequence

**Immediately after:** Email replay link + PDF of the build steps + links to free templates

**Day 2:** "Did you try building the automation? Reply with questions, happy to help."

**Day 5:** "Here are 3 more automations you can build with the same tools" (link to templates page)

**Day 10:** "Ready for a custom automation? Book your free audit" (link to audit form)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Registrations | 50-100 |
| Live attendance rate | 40-50% |
| Replay views (7 days) | 60-70% of registrants |
| Audit form submissions | 8-15 (15-20% of attendees) |
| Qualified conversations | 3-5 |
| Clients closed from webinar funnel | 1-2 |

---

*Webinar designed for ClawOps lead generation. Reusable monthly with different automation builds (invoice processing, reporting, email follow-up) to keep content fresh and capture new audiences.*
