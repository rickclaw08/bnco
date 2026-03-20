#!/usr/bin/env python3
"""Send free trial weekend emails to all leads with owner names."""
import csv, smtplib, os, time, re, urllib.request, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER = "rickclaw08@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
CSV_PATH = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/mega-lead-scrape-enriched.csv"
SENT_LOG = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/free-trial-sent.log"

SUBJECT = "Try it free this weekend - AI receptionist for {business}"
BODY = """{owner},

Quick question - what happens when a customer calls {business} at 6 PM on a Friday?

If the answer is voicemail, you're losing jobs. The average HVAC emergency call is worth $500 to $800. Plumbing emergency, same ballpark.

I built an AI receptionist that answers every call, 24/7. Sounds like a real person. Books appointments. Handles emergencies. Never calls in sick.

Instead of explaining it, I'd rather just show you.

Call this number right now: (513) 995-3285

That's a live demo. It answers as "Summit Heating & Cooling." Talk to it like you're a customer with a broken AC. See for yourself.

If you like what you hear, I'll set one up for {business} this weekend. You test it with real calls. If you don't love it by Monday, I shut it off. No card, no commitment.

- Rick
ClawOps | AI that answers your phone
(513) 778-8336
theclawops.com

To stop receiving emails, reply STOP.
ClawOps LLC, 7800 Montgomery Road, Cincinnati, OH 45236
"""

def find_email(website):
    if not website:
        return None
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(website, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', html)
        good = [e for e in emails if not any(x in e.lower() for x in ['example','sentry','wordpress','gravatar','wix','google','.png','.jpg','.svg','schema','cloudflare'])]
        if good:
            return good[0]
    except:
        pass
    domain = website.replace('https://','').replace('http://','').replace('www.','').split('/')[0].split('?')[0]
    if domain:
        return f"info@{domain}"
    return None

def load_sent():
    sent = set()
    if os.path.exists(SENT_LOG):
        with open(SENT_LOG) as f:
            for line in f:
                sent.add(line.strip())
    return sent

def main():
    if not GMAIL_APP_PASSWORD:
        print("ERROR: GMAIL_APP_PASSWORD not set")
        return

    sent = load_sent()
    leads = []
    with open(CSV_PATH) as f:
        for row in csv.DictReader(f):
            owner = row.get('Owner_Name','').strip()
            website = row.get('Website','').strip()
            if owner and website:
                leads.append(row)

    print(f"Processing {len(leads)} leads with owner names")
    sent_count = 0
    fail_count = 0
    skip_count = 0

    for i, lead in enumerate(leads):
        business = lead['Business Name']
        owner = lead['Owner_Name']
        email = find_email(lead['Website'])

        if not email:
            skip_count += 1
            continue
        if email in sent:
            skip_count += 1
            continue

        subject = SUBJECT.format(business=business)
        body = BODY.format(owner=owner, business=business)

        msg = MIMEMultipart('alternative')
        msg['From'] = f"Rick | ClawOps <{GMAIL_USER}>"
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
                server.send_message(msg)
            with open(SENT_LOG, 'a') as f:
                f.write(email + '\n')
            sent_count += 1
            print(f"[{sent_count}] SENT: {business} -> {email}")
            time.sleep(4)  # Rate limit
        except Exception as e:
            fail_count += 1
            print(f"FAIL: {business} ({email}) - {str(e)[:80]}")
            time.sleep(2)

    print(f"\nDone: {sent_count} sent, {fail_count} failed, {skip_count} skipped")

if __name__ == '__main__':
    main()
