#!/usr/bin/env python3
"""
Send spec website outreach emails for ClawOps.
Reads prospects.json and sends personalized emails with live demo links.
"""

import smtplib
import json
import os
import sys
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROSPECTS_PATH = os.path.join(SCRIPT_DIR, "prospects.json")

GMAIL_USER = os.environ.get("GMAIL_USER", "rickclaw08@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
FROM_NAME = "Rick Claw"
BASE_URL = "https://rickclaw08.github.io/client-demos"

import re
def get_slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

NICHE_PRICES = {
    "chiropractic": "1,800",
    "roofing": "1,500",
    "hvac": "1,500",
    "dental": "2,000",
    "law_firm": "2,500",
    "medspa": "2,200",
    "remodeling": "1,800",
    "real_estate": "1,800",
    "auto_body": "1,500",
}

NICHE_LABELS = {
    "chiropractic": "chiropractic",
    "roofing": "roofing",
    "hvac": "HVAC",
    "dental": "dental",
    "law_firm": "legal",
    "medspa": "med spa",
    "remodeling": "remodeling",
    "real_estate": "real estate",
    "auto_body": "auto body",
}

def build_email(prospect):
    slug = get_slug(prospect["name"])
    demo_url = f"{BASE_URL}/{slug}/"
    niche = prospect.get("niche_key", "roofing")
    price = NICHE_PRICES.get(niche, "1,500")
    niche_label = NICHE_LABELS.get(niche, niche.replace("_", " "))
    city = prospect.get("city", "your area")
    biz_name = prospect["name"]

    subject = f"I built {biz_name} a new website"

    body = f"""Hi there,

I'm Rick from ClawOps. I came across {biz_name} while researching {niche_label} businesses in {city} and noticed your website could use a modern refresh.

So I built you one: {demo_url}

No catch. I wanted to show you what a clean, mobile-friendly site looks like for a business like yours. This is a working demo, not a mockup.

What you would get:
- Fast, modern design that works perfectly on phones and desktops
- SEO-optimized structure so customers find you on Google
- Professional look that matches the quality of your actual work
- Easy to update content and services

If you like it, we can make it your live site for ${price} (one-time, includes setup, custom domain connection, and 30 days of support).

If not, no worries at all. Keep doing great work either way.

Want to talk about it? Just reply to this email.

Rick Claw
ClawOps | theclawops.com
"""
    return subject, body

def send_email(to_email, subject, body):
    if not GMAIL_APP_PASSWORD:
        print(f"SKIP (no app password): {to_email}")
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
        print(f"SENT: {to_email} - {subject}")
        return True
    except Exception as e:
        print(f"FAIL: {to_email} - {e}")
        return False

def main():
    dry_run = "--dry-run" in sys.argv

    prospects_file = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else PROSPECTS_PATH

    with open(prospects_file) as f:
        prospects = json.load(f)

    sent = 0
    failed = 0

    for p in prospects:
        email = p.get("email")
        if not email:
            print(f"SKIP (no email): {p['name']}")
            continue

        subject, body = build_email(p)

        if dry_run:
            slug = get_slug(p["name"])
            print(f"\n--- DRY RUN ---")
            print(f"To: {email}")
            print(f"Subject: {subject}")
            print(f"Demo: {BASE_URL}/{slug}/")
            print(body[:300] + "...\n")
        else:
            if send_email(email, subject, body):
                sent += 1
            else:
                failed += 1
            time.sleep(15)

    total = len(prospects)
    skipped = total - sent - failed
    print(f"\nResults: {sent} sent, {failed} failed, {skipped} skipped (of {total} total)")

    # Log
    log_path = os.path.join(SCRIPT_DIR, "send-log.json")
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "sent": sent,
        "failed": failed,
        "skipped": skipped,
        "dry_run": dry_run,
        "file": prospects_file,
    }
    logs = []
    if os.path.exists(log_path):
        with open(log_path) as f:
            logs = json.load(f)
    logs.append(entry)
    with open(log_path, "w") as f:
        json.dump(logs, f, indent=2)

if __name__ == "__main__":
    main()
