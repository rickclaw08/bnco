#!/usr/bin/env python3
"""
Home Services Cold Outreach Sender
Sends the "Missed Call" email from outreach-home-services.md
Uses rickclaw08@gmail.com with app password
"""

import json
import smtplib
import sys
import time
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

GMAIL_USER = "rickclaw08@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "fuouipgnupmddfyh")
FROM_NAME = "Rick Claw"
DELAY_BETWEEN_EMAILS = 45  # seconds

TRADE_DETAILS = {
    "hvac": {
        "trade_name": "HVAC",
        "pain": "Emergency calls at 2 AM when the AC dies in July",
        "job_value": "$3,000-$15,000",
        "common_service": "AC repair"
    },
    "plumbing": {
        "trade_name": "plumbing",
        "pain": "Burst pipe at 11 PM - customer calls 3 plumbers, hires the first one who answers",
        "job_value": "$500-$8,000",
        "common_service": "emergency repair"
    },
    "electrical": {
        "trade_name": "electrical",
        "pain": "Panel upgrade quote request - customer calls Monday, you call back Wednesday, they already hired someone",
        "job_value": "$2,000-$10,000",
        "common_service": "panel upgrade"
    },
    "roofing": {
        "trade_name": "roofing",
        "pain": "Storm hits, 50 homeowners call for inspections. You can handle 10 calls. 40 hire someone else",
        "job_value": "$8,000-$25,000",
        "common_service": "roof inspection"
    },
    "landscaping": {
        "trade_name": "landscaping",
        "pain": "Spring quote requests pour in. You're out mowing. Calls go to voicemail",
        "job_value": "$200-$5,000",
        "common_service": "landscape project"
    }
}


def build_email(prospect):
    trade = prospect.get("trade", "hvac").lower()
    details = TRADE_DETAILS.get(trade, TRADE_DETAILS["hvac"])
    company = prospect["company"]
    contact = prospect.get("contact_name", "").split()[0] if prospect.get("contact_name") else ""
    greeting = f"Hi {contact}," if contact else f"Hi {company} Team,"

    subject = f"Quick question about missed calls at {company}"

    body = f"""{greeting}

I'll keep this short.

The average {details['trade_name']} company misses 30-40% of incoming calls during business hours. On job sites, in attics, under houses - you can't answer every call. Each missed call is a {details['job_value']} job walking to your competitor.

We built an AI phone system specifically for {details['trade_name']} companies that:
- Answers every call 24/7 (even 2 AM emergency calls)
- Qualifies the lead and books the appointment for you
- Texts customers back instantly when you miss a call
- Costs less than a third of what you'd pay a receptionist service

One of our clients was missing 35+ calls per week. Within 30 days of going live, they booked an extra $22K in jobs from calls that would've gone to voicemail.

Worth a 15-minute call to see if this fits {company}?

Rick Claw
ClawOps | theclawops.com

P.S. - We start every engagement with a $500 AI Readiness Audit where we actually call your business as a fake customer and measure your response time. Most owners are shocked by what we find."""

    return subject, body


def send_email(to_email, subject, body, dry_run=False):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{GMAIL_USER}>"
    msg["To"] = to_email
    msg["Bcc"] = GMAIL_USER

    msg.attach(MIMEText(body, "plain"))

    if dry_run:
        print(f"  [DRY RUN] Would send to: {to_email}")
        print(f"  Subject: {subject}")
        return True

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, [to_email, GMAIL_USER], msg.as_string())
        print(f"  SENT to: {to_email}")
        return True
    except Exception as e:
        print(f"  FAILED to: {to_email} - {e}")
        return False


def main():
    prospects_file = os.path.join(os.path.dirname(__file__), "leads", "home-services-prospects-feb25.json")

    if not os.path.exists(prospects_file):
        print(f"Prospects file not found: {prospects_file}")
        print("Run lead research first.")
        sys.exit(1)

    with open(prospects_file) as f:
        prospects = json.load(f)

    dry_run = "--dry-run" in sys.argv
    limit = None
    for arg in sys.argv:
        if arg.startswith("--limit="):
            limit = int(arg.split("=")[1])

    if dry_run:
        print("=== DRY RUN MODE ===\n")

    log_file = os.path.join(os.path.dirname(__file__), "leads", "home-services-send-log.json")
    existing_log = []
    if os.path.exists(log_file):
        with open(log_file) as f:
            existing_log = json.load(f)

    already_sent = {e["email"] for e in existing_log if e.get("status") == "sent"}

    sent = 0
    skipped = 0
    failed = 0

    for prospect in prospects:
        if limit and sent >= limit:
            print(f"\nReached limit of {limit} emails.")
            break

        email_addr = prospect.get("email", "")
        if not email_addr or "@" not in email_addr:
            print(f"  SKIP (no email): {prospect.get('company', 'unknown')}")
            skipped += 1
            continue

        if email_addr in already_sent:
            print(f"  SKIP (already sent): {email_addr}")
            skipped += 1
            continue

        subject, body = build_email(prospect)
        success = send_email(email_addr, subject, body, dry_run=dry_run)

        log_entry = {
            "company": prospect.get("company", ""),
            "email": email_addr,
            "trade": prospect.get("trade", ""),
            "city": prospect.get("city", ""),
            "state": prospect.get("state", ""),
            "subject": subject,
            "status": "sent" if success else "failed",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S EST"),
            "dry_run": dry_run
        }
        existing_log.append(log_entry)

        if success:
            sent += 1
        else:
            failed += 1

        if not dry_run and sent < (limit or len(prospects)):
            print(f"  Waiting {DELAY_BETWEEN_EMAILS}s...")
            time.sleep(DELAY_BETWEEN_EMAILS)

    with open(log_file, "w") as f:
        json.dump(existing_log, f, indent=2)

    print(f"\n=== RESULTS ===")
    print(f"Sent: {sent}")
    print(f"Failed: {failed}")
    print(f"Skipped: {skipped}")
    print(f"Log saved to: {log_file}")


if __name__ == "__main__":
    main()
