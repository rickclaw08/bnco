#!/usr/bin/env python3
"""Send HVAC-focused founding member emails to HVAC leads from the Monday call sheet."""
import csv, smtplib, os, time, re, urllib.request, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER = "rickclaw08@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "fuouipgnupmddfyh")
CALL_SHEET = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/monday-call-sheet.csv"
SENT_LOG = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/outreach-sent.log"
MAX_PER_RUN = 100

SUBJECT_OWNER = "{owner}, what happens when {business} misses a call?"
SUBJECT_NO_OWNER = "What happens when {business} misses a call?"

BODY_TEMPLATE = """{greeting}

Quick math for HVAC owners: the average missed call costs $180 in lost revenue. Emergency calls? $900+.

I built an AI phone system specifically for HVAC companies. It answers every call 24/7, sounds like a real person, books the appointment, and texts you the details. No voicemail. No missed jobs. No answering service bills.

Instead of explaining it, just call this number right now:

(513) 995-3285

That's a live demo. Talk to it like you're a homeowner with a broken AC. See for yourself.

Right now I'm offering a founding member deal to 20 HVAC companies: $1,997 one-time. No monthly fees. Ever. After the 20 spots fill, it goes to $2,500 setup + $550/month.

If you want in, reply to this email or call me at (513) 778-8336.

- Rick
ClawOps | AI Phone Systems for HVAC
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
        good = [e for e in emails if not any(x in e.lower() for x in
            ['example','sentry','wordpress','gravatar','wix','google','.png','.jpg',
             '.svg','schema','cloudflare','noreply','no-reply','privacy','abuse',
             'postmaster','webmaster','support@wix','support@squarespace'])]
        if good:
            return good[0].strip()
    except:
        pass
    domain = website.replace('https://','').replace('http://','').replace('www.','').split('/')[0].split('?')[0].strip()
    if domain and '.' in domain and not any(x in domain for x in ['facebook','yelp','google','yellowpages','bbb','homeadvisor']):
        return f"info@{domain}"
    return None

def load_sent():
    sent = set()
    for log in [SENT_LOG, SENT_LOG.replace('outreach-sent', 'free-trial-sent')]:
        if os.path.exists(log):
            with open(log) as f:
                for line in f:
                    sent.add(line.strip().lower())
    return sent

def is_hvac(row):
    niche = (row.get('niche','') or '').strip().lower()
    biz = (row.get('business','') or '').lower()
    return niche == 'hvac' or any(kw in biz for kw in ['heating','cooling','air condition','hvac','a/c ','ac '])

def main():
    sent = load_sent()
    print(f"Already sent to {len(sent)} addresses")

    leads = []
    with open(CALL_SHEET) as f:
        for row in csv.DictReader(f):
            if is_hvac(row) and row.get('website','').strip():
                leads.append(row)

    print(f"HVAC leads with websites: {len(leads)}")
    sent_count = 0
    fail_count = 0
    skip_count = 0

    for lead in leads:
        if sent_count >= MAX_PER_RUN:
            print(f"\nHit run limit ({MAX_PER_RUN}). Stopping.")
            break

        business = lead['business'].strip()
        owner = lead.get('owner_name','').strip()
        website = lead.get('website','').strip().replace('\n','').replace('\r','')
        if website and not website.startswith('http'):
            website = 'https://' + website

        email = find_email(website)
        if not email or '\n' in email or '\r' in email or ' ' in email:
            skip_count += 1
            continue
        if email.lower() in sent:
            skip_count += 1
            continue

        first = owner.split()[0] if owner else None
        if first:
            subject = SUBJECT_OWNER.format(owner=first, business=business)
            greeting = f"{first},"
        else:
            subject = SUBJECT_NO_OWNER.format(business=business)
            greeting = "Hey,"

        body = BODY_TEMPLATE.format(greeting=greeting, business=business)

        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = f"Rick | ClawOps <{GMAIL_USER}>"
            msg['To'] = email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
                server.send_message(msg)
            with open(SENT_LOG, 'a') as f:
                f.write(email.lower() + '\n')
            sent.add(email.lower())
            sent_count += 1
            tier = lead.get('tier','')
            print(f"[{sent_count}] SENT ({tier}): {business} -> {email}")
            time.sleep(4)
        except Exception as e:
            fail_count += 1
            err = str(e)[:80]
            print(f"FAIL: {business} ({email}) - {err}")
            if 'Daily user sending quota exceeded' in str(e):
                print("Gmail quota hit. Stopping.")
                break
            time.sleep(2)

    print(f"\nDone: {sent_count} sent, {fail_count} failed, {skip_count} skipped")

if __name__ == '__main__':
    main()
