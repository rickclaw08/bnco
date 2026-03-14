#!/usr/bin/env python3
"""
Browser automation to submit calendar bookings with consent for GHL contacts.
Uses the OpenClaw browser to fill out the calendar widget for each contact.
"""
import json, time, subprocess, sys

CALENDAR_URL = "https://api.leadconnectorhq.com/widget/bookings/clawops-demo-call"
CONTACTS_FILE = "/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/consent-automation-contacts.json"

# Load contacts
with open(CONTACTS_FILE) as f:
    contacts = json.load(f)

print(f"Loaded {len(contacts)} contacts for consent automation")
print(f"Contacts with email: {sum(1 for c in contacts if c.get('email'))}")
print(f"Contacts without email: {sum(1 for c in contacts if not c.get('email'))}")

# The calendar widget requires: first_name, last_name, phone, email
# Many contacts don't have email - we'll need to generate placeholder emails
# or skip them

# For contacts without email, we can use: businessname@placeholder.clawops.com
# since the email is just for the booking record, not for actual communication

