#!/usr/bin/env python3
"""
ClawOps Founding Member Outreach - Email Sender
Sends personalized cold emails to verified contractor prospects.
"""

import smtplib
import os
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER = "rickclaw08@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
FROM_NAME = "Rick Claw | ClawOps"

if not GMAIL_APP_PASSWORD:
    print("ERROR: GMAIL_APP_PASSWORD env var not set")
    exit(1)

# Verified prospects with personalization
prospects = [
    {"email": "foxcrofthvac@gmail.com", "name": "there", "company": "Foxcroft HVAC & Refrigeration", "trade": "HVAC"},
    {"email": "MechanicalOptions@gmail.com", "name": "there", "company": "Mechanical Options LLC", "trade": "HVAC"},
    {"email": "kpheatingandcooling19@gmail.com", "name": "there", "company": "KP Heating & Cooling", "trade": "HVAC"},
    {"email": "warnerhomecomfort@gmail.com", "name": "there", "company": "Warner Home Comfort", "trade": "HVAC & Plumbing"},
    {"email": "fastresponseservice@gmail.com", "name": "there", "company": "Fast Response Heating & Cooling", "trade": "HVAC"},
    {"email": "mrthvaccontracting@gmail.com", "name": "there", "company": "MRT HVAC Contracting", "trade": "HVAC"},
    {"email": "tomhiattsplumbing@gmail.com", "name": "Tom", "company": "Tom Hiatt's Plumbing & HVAC", "trade": "plumbing"},
    {"email": "airstreamplumbingheating@gmail.com", "name": "there", "company": "Air-Stream Plumbing Heating Cooling", "trade": "plumbing & HVAC"},
    {"email": "walkerroofingandconst@gmail.com", "name": "there", "company": "Walker Roofing & Construction", "trade": "roofing"},
    {"email": "hillcrestroofingllc@gmail.com", "name": "there", "company": "Hillcrest Roofing & Restoration", "trade": "roofing"},
    {"email": "duffeyexteriorsllc@gmail.com", "name": "Zalen", "company": "Duffey Exteriors LLC", "trade": "roofing"},
    {"email": "go2roofers@gmail.com", "name": "there", "company": "GO2 Roofers", "trade": "roofing"},
    {"email": "sctroofingllc@gmail.com", "name": "there", "company": "Slate Copper & Tile Roofing", "trade": "roofing"},
    {"email": "jardonekt@gmail.com", "name": "there", "company": "T J & Sons Roofing & Remodeling", "trade": "roofing"},
    {"email": "midtownroofingoh@gmail.com", "name": "there", "company": "Midtown Roofing Construction", "trade": "roofing"},
    {"email": "lelanelectric@gmail.com", "name": "there", "company": "Lelan Electric", "trade": "electrical"},
    {"email": "zachiarydk8911@gmail.com", "name": "there", "company": "S&K Construction And Remodeling", "trade": "roofing"},
]

def build_email(prospect):
    subject = "You lost a customer last night at 8pm"
    
    name = prospect["name"]
    trade = prospect["trade"]
    greeting = f"Hi {name}," if name != "there" else "Hi there,"
    
    body = f"""{greeting}

I'm Rick from ClawOps. We build AI-powered phone systems for {trade} companies.

Here's the reality: the average {trade} business misses 30-60% of incoming calls. Every missed call is $500-2,000 in lost revenue. That's $4,000-12,000/month walking straight to your competitor.

After-hours calls. Busy dispatchers. Lunch breaks. Calls while you're on a job site. Every single one of those is revenue you're losing right now.

We built something that fixes this permanently.

Our AI receptionist answers every call 24/7, books appointments, handles scheduling, and sounds like a real person - not a robot. Try it yourself right now:

Call (614) 926-0190 - that's our AI. Judge for yourself.

Or see it in action: https://theclawops.com/demo/receptionist-v2/

Here's why I'm reaching out today:

We're taking on 20 Founding Members at a one-time cost of $1,997 - that's it, no monthly fees, ever. Our normal pricing is $2,500 setup + $497/month. Founding Members get everything for a single flat payment.

- AI receptionist that answers 24/7/365
- Appointment booking and scheduling
- Custom trained on YOUR business
- No contracts, no monthly fees
- Setup in under 48 hours

Once 20 spots fill, this offer is gone and we move to standard pricing.

See the full details here: https://theclawops.com/founding/

If you want to stop losing money to missed calls, reply to this email or call us at (614) 926-0190.

Rick Claw
ClawOps - AI That Answers Every Call
https://theclawops.com

P.S. - Seriously, call (614) 926-0190 right now. You'll hear exactly what your customers would hear. If it doesn't impress you, no hard feelings."""

    return subject, body

def send_email(to_email, subject, body):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{GMAIL_USER}>"
    msg["To"] = to_email
    
    # Plain text version
    msg.attach(MIMEText(body, "plain"))
    
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"  ERROR sending to {to_email}: {e}")
        return False

# Main execution
print(f"Starting outreach campaign: {len(prospects)} prospects")
print(f"From: {FROM_NAME} <{GMAIL_USER}>")
print("=" * 60)

sent = 0
failed = 0

for i, prospect in enumerate(prospects, 1):
    subject, body = build_email(prospect)
    print(f"\n[{i}/{len(prospects)}] Sending to: {prospect['company']}")
    print(f"  Email: {prospect['email']}")
    print(f"  Trade: {prospect['trade']}")
    
    success = send_email(prospect["email"], subject, body)
    
    if success:
        sent += 1
        print(f"  SENT successfully")
    else:
        failed += 1
        print(f"  FAILED")
    
    # Rate limit: wait 10 seconds between emails to avoid Gmail throttling
    if i < len(prospects):
        print(f"  Waiting 10s before next send...")
        time.sleep(10)

print("\n" + "=" * 60)
print(f"CAMPAIGN COMPLETE")
print(f"  Sent: {sent}")
print(f"  Failed: {failed}")
print(f"  Total: {len(prospects)}")
