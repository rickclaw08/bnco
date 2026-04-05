#!/usr/bin/env python3
"""Send pending follow-up emails from JSON queue."""
import json, smtplib, subprocess, sys, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

QUEUE_FILE = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/pending-followup-emails-20260323.json"
SENT_LOG = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/sent-followup-emails-20260323.json"

result = subprocess.run(["zsh", "-c", "source ~/.zshrc && echo $GMAIL_APP_PASSWORD"], capture_output=True, text=True)
GMAIL_PASS = result.stdout.strip()
GMAIL_USER = "rickclaw08@gmail.com"

if not GMAIL_PASS:
    print("ERROR: No GMAIL_APP_PASSWORD found")
    sys.exit(1)

with open(QUEUE_FILE) as f:
    emails = json.load(f)

sent = []
failed = []

try:
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    server.login(GMAIL_USER, GMAIL_PASS)
    
    for e in emails:
        msg = MIMEMultipart()
        msg["From"] = f"Jordan at Claw Ops <{GMAIL_USER}>"
        msg["To"] = e["to"]
        msg["Subject"] = e["subject"]
        msg.attach(MIMEText(e["body"], "plain"))
        
        try:
            server.sendmail(GMAIL_USER, e["to"], msg.as_string())
            sent.append({"to": e["to"], "business": e["business"], "sent_at": datetime.now().isoformat()})
            print(f"SENT: {e['to']} ({e['business']})")
        except Exception as ex:
            failed.append({"to": e["to"], "business": e["business"], "error": str(ex)})
            print(f"FAILED: {e['to']} - {ex}")
    
    server.quit()
except Exception as ex:
    print(f"SMTP CONNECTION ERROR: {ex}")
    sys.exit(1)

with open(SENT_LOG, "w") as f:
    json.dump({"sent": sent, "failed": failed, "timestamp": datetime.now().isoformat()}, f, indent=2)

print(f"\nSent: {len(sent)}, Failed: {len(failed)}")
