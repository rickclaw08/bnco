#!/usr/bin/env python3
"""
Send spec website outreach emails.
Reads prospects JSON, personalizes email template, sends via Gmail SMTP.
Designed to run as a cron job at 9:30 AM EST.
"""

import smtplib
import json
import os
import sys
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "email-template.md")
GITHUB_USER = "rickclaw08"
REPO_NAME = "client-demos"
BASE_URL = f"https://{GITHUB_USER}.github.io/{REPO_NAME}"

GMAIL_USER = os.environ.get("GMAIL_USER", "rickclaw08@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
FROM_NAME = "Rick Claw"
OUR_PHONE = "(512) 555-0199"  # Update with real number

# Pricing tiers based on niche revenue
PRICING = {
    "law_firm": {"min": 2500, "max": 5000},
    "medspa": {"min": 2000, "max": 4000},
    "dental": {"min": 1500, "max": 3500},
    "roofing": {"min": 1200, "max": 2500},
    "hvac": {"min": 1200, "max": 2500},
    "real_estate": {"min": 1500, "max": 3000},
    "chiropractic": {"min": 1200, "max": 2500},
    "remodeling": {"min": 1500, "max": 3000},
    "auto_body": {"min": 1200, "max": 2500},
}


def get_price(prospect):
    """Calculate price based on niche and estimated revenue."""
    niche = prospect.get("niche_key", "roofing")
    tier = PRICING.get(niche, {"min": 1500, "max": 3000})
    # Default to mid-range
    return str(tier["min"] + (tier["max"] - tier["min"]) // 2)


def get_slug(name):
    import re
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def send_email(to_email, subject, body):
    """Send email via Gmail SMTP."""
    if not GMAIL_APP_PASSWORD:
        print(f"SKIP (no password): {to_email}")
        return False
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{GMAIL_USER}>"
    msg["To"] = to_email
    
    msg.attach(MIMEText(body, "plain"))
    
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        print(f"SENT: {to_email}")
        return True
    except Exception as e:
        print(f"FAIL: {to_email} - {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python send_emails.py <prospects.json> [--dry-run]")
        sys.exit(1)
    
    dry_run = "--dry-run" in sys.argv
    
    with open(sys.argv[1]) as f:
        prospects = json.load(f)
    
    with open(TEMPLATE_PATH) as f:
        template = f.read()
    
    # Strip the "Subject: " line from template
    lines = template.strip().split("\n")
    subject_template = lines[0].replace("Subject: ", "")
    body_template = "\n".join(lines[2:])  # Skip subject + blank line
    
    sent = 0
    failed = 0
    
    for p in prospects:
        if not p.get("email"):
            print(f"SKIP (no email): {p['name']}")
            continue
        
        slug = get_slug(p["name"])
        demo_url = f"{BASE_URL}/{slug}/"
        price = get_price(p)
        
        # Get first name from contact or business name
        first_name = p.get("contact_name", "").split()[0] if p.get("contact_name") else "there"
        
        niche_label = p.get("niche_key", "").replace("_", " ")
        
        body = body_template
        body = body.replace("{{FIRST_NAME}}", first_name)
        body = body.replace("{{BUSINESS_NAME}}", p["name"])
        body = body.replace("{{NICHE}}", niche_label)
        body = body.replace("{{CITY}}", p.get("city", "your area"))
        body = body.replace("{{DEMO_URL}}", demo_url)
        body = body.replace("{{PRICE}}", price)
        body = body.replace("{{OUR_PHONE}}", OUR_PHONE)
        
        subject = subject_template
        
        if dry_run:
            print(f"\n--- DRY RUN: {p['name']} ---")
            print(f"To: {p['email']}")
            print(f"Subject: {subject}")
            print(f"Demo: {demo_url}")
            print(f"Price: ${price}")
            print(body[:200] + "...")
        else:
            if send_email(p["email"], subject, body):
                sent += 1
            else:
                failed += 1
            # 15 second delay between sends
            time.sleep(15)
    
    print(f"\nResults: {sent} sent, {failed} failed, {len(prospects) - sent - failed} skipped")
    
    # Log results
    log_path = os.path.join(os.path.dirname(__file__), "send-log.json")
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "sent": sent,
        "failed": failed,
        "dry_run": dry_run,
        "prospects_file": sys.argv[1],
    }
    
    logs = []
    if os.path.exists(log_path):
        with open(log_path) as f:
            logs = json.load(f)
    logs.append(log_entry)
    with open(log_path, "w") as f:
        json.dump(logs, f, indent=2)


if __name__ == "__main__":
    main()
