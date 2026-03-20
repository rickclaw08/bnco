#!/usr/bin/env python3
"""Send follow-up emails to Tier 1 leads from Mar 18 report."""

import smtplib
import os
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER = "rickclaw08@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
FROM_NAME = "Jordan | ClawOps"
DEMO_NUMBER = "(513) 995-3285"

# Tier 1 leads with emails from Mar 18 report
LEADS = [
    {"name": "John", "company": "Redcap", "email": "jsmith@redcapnow.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Brent", "company": "J&W Heating", "email": "info@jandwheatingandair.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "George", "company": "Royal Air", "email": "royalairtx@gmail.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Keith", "company": "Keefe's", "email": "info@keefes.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Brenda", "company": "Summit HCKC", "email": "info@summithckc.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Team", "company": "Champion AC", "email": "service@championac.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Jesse", "company": "Semperfi Heating", "email": "customercare@semperfiheatingcooling.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Sean", "company": "Same Day Utah", "email": "contact@samedayutah.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Team", "company": "Call Doctor Fixit", "email": "info@calldoctorfixit.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Team", "company": "Gettle", "email": "info@gettle.com", "niche": "electrical", "job_value": "$2,000-5,000 panel upgrade"},
    {"name": "Team", "company": "Horn HVAC", "email": "marketing@hornhvac.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Team", "company": "Burke's AC", "email": "burkesmarketing@burkes.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
    {"name": "Claire", "company": "John Moore Services", "email": "assistance@johnmooreservices.com", "niche": "HVAC", "job_value": "$5,000-15,000 install"},
]

def build_email(lead):
    name = lead["name"]
    niche = lead["niche"]
    job_value = lead["job_value"]
    greeting = f"Hey {name}," if name != "Team" else f"Hey {lead['company']} team,"
    
    body = f"""{greeting}

Jordan from ClawOps here. I called earlier this week about something I thought you'd find interesting.

Most {niche} contractors lose 3-5 calls a week to voicemail when they're on a job or after hours. Each one is a potential {job_value} job going to whoever answers first.

We built an AI receptionist that answers every call, books the job, and your customers never know the difference. We only work with one {niche} company per zip code.

Here's a number you can call right now to test it yourself: {DEMO_NUMBER}. Call it pretending you're a homeowner with an {niche.upper()} emergency. See how it handles it.

Worth 5 minutes this week? I can walk you through how it works for your business specifically.

Jordan
ClawOps
(513) 778-8336
contact@theclawops.com
7800 Montgomery Road, Cincinnati, OH 45236

To opt out of future emails, reply STOP."""

    return body

def send_email(lead, dry_run=False):
    body = build_email(lead)
    
    msg = MIMEMultipart()
    msg["From"] = f"{FROM_NAME} <{GMAIL_USER}>"
    msg["To"] = lead["email"]
    msg["Subject"] = "Quick question about your missed calls"
    msg.attach(MIMEText(body, "plain"))
    
    if dry_run:
        print(f"  [DRY RUN] Would send to {lead['email']}")
        return True
    
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        print(f"  SENT to {lead['email']}")
        return True
    except Exception as e:
        print(f"  FAILED {lead['email']}: {e}")
        return False

if __name__ == "__main__":
    import sys
    dry_run = "--dry-run" in sys.argv
    
    if not GMAIL_APP_PASSWORD and not dry_run:
        print("ERROR: GMAIL_APP_PASSWORD not set")
        sys.exit(1)
    
    print(f"{'DRY RUN - ' if dry_run else ''}Sending to {len(LEADS)} Tier 1 leads")
    print(f"Demo number: {DEMO_NUMBER}")
    print()
    
    sent = 0
    failed = 0
    for i, lead in enumerate(LEADS, 1):
        print(f"[{i}/{len(LEADS)}] {lead['company']} ({lead['name']})")
        if send_email(lead, dry_run):
            sent += 1
        else:
            failed += 1
        if not dry_run and i < len(LEADS):
            time.sleep(3)  # rate limit
    
    print(f"\nDone. Sent: {sent}, Failed: {failed}")
