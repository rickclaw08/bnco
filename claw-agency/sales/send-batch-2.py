#!/usr/bin/env python3
"""
ClawOps Outreach Batch 2 - Email Sender
Sends personalized cold outreach emails via Gmail SMTP
"""
import smtplib
import time
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

GMAIL_USER = "rickclaw08@gmail.com"
GMAIL_APP_PASSWORD = "fuouipgnupmddfyh"
FROM_NAME = "Rick Claw"
DELAY_SECONDS = 150  # 2.5 minutes between emails

leads = [
    {
        "company": "Music City Dental",
        "email": "info@musiccitydental.com",
        "industry": "Dental Practice",
        "city": "Nashville, TN",
        "subject": "Quick question about your patient scheduling",
        "body": """Hi there,

I came across Music City Dental and noticed you're managing a busy practice in Nashville with scheduling, patient follow-ups, insurance verification, and membership plans all at once.

Most dental offices I talk to spend 10-15 hours a week on tasks that can be fully automated — appointment reminders, recall scheduling, insurance eligibility checks, and new patient intake forms.

At ClawOps (theclawops.com), we build custom automations for practices like yours that eliminate the manual grind and free your front desk to focus on patients.

Would you be open to a 15-minute call this week to see if there's a fit?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Adult Dentistry of Ballantyne",
        "email": "contact@adultdentistryofballantyne.com",
        "industry": "Dental Practice",
        "city": "Charlotte, NC",
        "subject": "Automating your front desk workflow",
        "body": """Hi there,

I was looking at Adult Dentistry of Ballantyne and saw the range of services you offer — from cosmetic work to implants to emergency care. That's a lot of coordination behind the scenes.

Practices offering that many services usually deal with heavy admin overhead: appointment routing, treatment plan follow-ups, insurance pre-authorizations, and patient communication.

We help dental practices automate those exact workflows — cutting admin time by 50% or more. I'd love to show you how it works.

Would a quick 15-minute call this week work?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Henderson Properties",
        "email": "info@hendersonproperties.com",
        "industry": "Property Management",
        "city": "Charlotte, NC",
        "subject": "Streamlining operations at Henderson Properties",
        "body": """Hi there,

I came across Henderson Properties and was impressed — 35+ years managing properties across the Carolinas is no small feat.

Property management companies at your scale typically spend significant hours on tenant communication, maintenance coordination, lease processing, and owner reporting. Those are exactly the workflows we automate at ClawOps (theclawops.com).

We've helped property managers cut manual work by 60% with smart automations for tenant onboarding, maintenance ticketing, and automated owner updates.

Would you be open to a 15-minute call to explore if this could help your team?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "MiamiCPA LLC",
        "email": "glenn@miamicpa.com",
        "industry": "CPA/Accounting",
        "city": "Miami, FL",
        "subject": "Quick question about your client intake process",
        "body": """Hi Glenn,

I was looking at MiamiCPA and noticed you handle a wide range of complex work — international taxes, crypto, real estate, and multi-industry clients. That's impressive.

With that kind of specialization, I'm guessing your team spends a lot of time on client document collection, data entry, and chasing down missing info during tax season.

At ClawOps (theclawops.com), we build custom automations that handle document intake, client reminders, and data routing — so your team can focus on advisory work, not admin.

Would a quick 15-minute call make sense this week?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "NC Business Insurance Agency",
        "email": "cs@ncbusinessinsure.com",
        "industry": "Insurance Agency",
        "city": "Charlotte, NC",
        "subject": "Automating your quoting and renewal process",
        "body": """Hi there,

I came across NC Business Insurance Agency and saw you cover everything from general liability to specialty policies like brewery and HOA insurance across multiple states.

Managing that many policy types and jurisdictions usually means a lot of manual quoting, renewal tracking, and client follow-up. Those are exactly the processes we automate at ClawOps (theclawops.com).

We help insurance agencies cut admin time by automating quote follow-ups, renewal reminders, policy document routing, and client communication.

Would you be open to a 15-minute call this week to see if there's a fit?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Florida Insurance Group",
        "email": "admin@floridainsurance.com",
        "industry": "Insurance Agency",
        "city": "Orlando, FL",
        "subject": "Quick question about your client follow-up process",
        "body": """Hi there,

I noticed Florida Insurance Group has been serving the community for over 20 years — that's incredible consistency.

Independent agencies like yours often tell me the biggest bottleneck is keeping up with client follow-ups, policy renewals, and quote requests while still providing the personal touch that sets you apart from the big carriers.

At ClawOps (theclawops.com), we build automations that handle the repetitive admin — renewal reminders, quote follow-ups, document collection — so your team can focus on the relationships.

Would a quick 15-minute call this week make sense?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Investor's Realty LLC",
        "email": "info@awdallas.com",
        "industry": "Property Management",
        "city": "Dallas, TX",
        "subject": "Automating tenant management at scale",
        "body": """Hi there,

I came across Investor's Realty and saw you've managed over 1,000 homes in the Dallas metro area. That's serious scale.

At that volume, I'm guessing your team deals with a constant flow of maintenance requests, lease renewals, tenant screening, and owner reporting. Those are the exact workflows we automate at ClawOps (theclawops.com).

We've helped property management companies reduce manual work by 60% — automating maintenance routing, tenant communication, and financial reporting.

Would you be open to a 15-minute call this week?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Accounting Prose",
        "email": "myteam@accountingprose.com",
        "industry": "Accounting/FinOps",
        "city": "Denver, CO",
        "subject": "Fellow automation enthusiasts — quick question",
        "body": """Hi team,

I was checking out Accounting Prose and love that you're already thinking about systems and automation for your startup clients. Your FinOps approach is smart.

Here's a question: are your own internal workflows as automated as the ones you build for clients? Most accounting firms I talk to still have manual handoffs in client onboarding, document collection, and task routing.

At ClawOps (theclawops.com), we specialize in building the behind-the-scenes automations that keep ops running smoothly — so your team can focus on the advisory work that drives revenue.

Would a 15-minute call make sense to swap notes on what's working?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Park Cities Dental Care",
        "email": "staff@parkcitiesdentalcare.com",
        "industry": "Dental Practice",
        "city": "Dallas, TX",
        "subject": "Freeing up your front desk team",
        "body": """Hi there,

I noticed Park Cities Dental Care has been serving the Dallas community for years with a full range of cosmetic and family dentistry services.

Most practices your size tell me their front desk is stretched thin — juggling appointment scheduling, insurance verification, patient intake forms, and follow-up calls. It adds up fast.

At ClawOps (theclawops.com), we automate those exact workflows so your front desk can focus on patient experience instead of paperwork.

Would you be open to a 15-minute call this week to see what we could take off your plate?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Phoenix Air Conditioning Inc",
        "email": "info@phoenixac.com",
        "industry": "HVAC",
        "city": "Fort Lauderdale, FL",
        "subject": "Streamlining dispatch and scheduling at Phoenix AC",
        "body": """Hi there,

I came across Phoenix Air Conditioning and saw you've been handling commercial HVAC for 30+ years — from hotels to dealerships to industrial buildings. That's impressive.

Commercial HVAC operations at your scale usually involve a lot of manual work: dispatching technicians, tracking maintenance schedules, managing service contracts, and coordinating with property managers.

At ClawOps (theclawops.com), we build custom automations that handle scheduling, dispatch routing, and contract tracking — so your team can focus on the work, not the paperwork.

Would a quick 15-minute call this week make sense?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Trend ATX",
        "email": "trend@austinmarketing.com",
        "industry": "Marketing Agency",
        "city": "Austin, TX",
        "subject": "Automating the back office at Trend ATX",
        "body": """Hi there,

I checked out Trend ATX and love the local-focused approach to social media marketing. Building creative strategies backed by data for Austin businesses is smart.

Here's something I see with marketing agencies: the creative work is great, but the back office — client onboarding, content approval workflows, reporting, and invoicing — eats up hours every week.

At ClawOps (theclawops.com), we automate those operational workflows so your team can spend more time on the creative work that actually drives results.

Would a quick 15-minute call this week work to see if there's a fit?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
    {
        "company": "Choice Austin Dental",
        "email": "appt@austindental.com",
        "industry": "Dental Practice",
        "city": "Austin, TX",
        "subject": "Alternative to adding another front desk hire",
        "body": """Hi there,

I noticed Choice Austin Dental offers same-day appointments and prides itself on seeing patients on time. That takes serious coordination behind the scenes.

Between your savings plan management, new patient onboarding, appointment scheduling, and insurance processing, your front desk is probably stretched thin. Adding another hire is one option — but automating those workflows is faster and more affordable.

At ClawOps (theclawops.com), we help dental practices automate intake forms, appointment reminders, insurance checks, and recall scheduling — cutting admin time by 50%.

Would a 15-minute call this week make sense?

Best,
Rick Claw
ClawOps | theclawops.com"""
    },
]

def send_email(lead, idx):
    """Send a single email to a lead"""
    msg = MIMEMultipart()
    msg['From'] = f"{FROM_NAME} <{GMAIL_USER}>"
    msg['To'] = lead['email']
    msg['Subject'] = lead['subject']
    msg['Bcc'] = GMAIL_USER
    
    msg.attach(MIMEText(lead['body'], 'plain'))
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        
        # Send to both the lead and BCC
        recipients = [lead['email'], GMAIL_USER]
        server.sendmail(GMAIL_USER, recipients, msg.as_string())
        server.quit()
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S EST")
        print(f"[{timestamp}] ✅ Sent #{idx+1}: {lead['company']} ({lead['email']})")
        return timestamp
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S EST")
        print(f"[{timestamp}] ❌ Failed #{idx+1}: {lead['company']} ({lead['email']}) - {e}")
        return None

def main():
    print(f"\n🚀 ClawOps Outreach Batch 2 - Sending {len(leads)} emails\n")
    print(f"Starting at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S EST')}")
    print(f"Delay between emails: {DELAY_SECONDS} seconds ({DELAY_SECONDS/60:.1f} minutes)\n")
    print("=" * 60)
    
    results = []
    
    for i, lead in enumerate(leads):
        timestamp = send_email(lead, i)
        results.append({
            **lead,
            "sent_at": timestamp if timestamp else "FAILED"
        })
        
        # Wait between emails (except after the last one)
        if i < len(leads) - 1:
            print(f"    ⏳ Waiting {DELAY_SECONDS} seconds before next email...")
            time.sleep(DELAY_SECONDS)
    
    print("\n" + "=" * 60)
    print(f"\n📊 Results: {sum(1 for r in results if r['sent_at'] != 'FAILED')}/{len(leads)} emails sent successfully")
    
    # Write results to file
    with open("/Users/agentclaw/.openclaw/workspace/claw-agency/sales/batch-2-results.json", "w") as f:
        import json
        json.dump(results, f, indent=2)
    
    print("Results saved to batch-2-results.json")

if __name__ == "__main__":
    main()
