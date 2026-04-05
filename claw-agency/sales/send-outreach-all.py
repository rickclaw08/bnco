#!/usr/bin/env python3
"""Send outreach emails to all leads with websites. Scrapes email from website, falls back to info@domain."""
import csv, smtplib, os, time, re, urllib.request, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER = "rickclaw08@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
CALL_SHEET = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/monday-call-sheet.csv"
SENT_LOG = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/outreach-sent.log"
MAX_PER_RUN = 140  # Gmail daily limit safety margin

SUBJECT_OWNER = "{owner}, quick question about {business}"
SUBJECT_NO_OWNER = "Quick question about {business}"

BODY_TEMPLATE = """{greeting}

What happens when a customer calls {business} at 6 PM on a Friday?

If the answer is voicemail, you're losing jobs. The average emergency service call is worth $500 to $800, and most of those callers move on to the next company that picks up.

I built an AI receptionist that answers every call, 24/7. Sounds like a real person. Books appointments. Captures lead info. Never calls in sick.

Instead of explaining it, I'd rather just show you.

Call this number right now: (513) 995-3285

That's a live demo running right now. Talk to it like you're a customer. See for yourself.

If you like what you hear, I'll set one up for {business}. You test it with real calls for a week. If you don't love it, I shut it off. No card required.

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
    if os.path.exists(SENT_LOG):
        with open(SENT_LOG) as f:
            for line in f:
                sent.add(line.strip().lower())
    # Also load old log
    old_log = SENT_LOG.replace('outreach-sent', 'free-trial-sent')
    if os.path.exists(old_log):
        with open(old_log) as f:
            for line in f:
                sent.add(line.strip().lower())
    return sent

def main():
    if not GMAIL_APP_PASSWORD:
        print("ERROR: GMAIL_APP_PASSWORD not set")
        return

    sent = load_sent()
    print(f"Already sent to {len(sent)} addresses")
    
    leads = []
    with open(CALL_SHEET) as f:
        for row in csv.DictReader(f):
            if row.get('website','').strip():
                leads.append(row)
    
    print(f"Leads with websites: {len(leads)}")
    sent_count = 0
    fail_count = 0
    skip_count = 0
    
    for lead in leads:
        if sent_count >= MAX_PER_RUN:
            print(f"\nHit daily limit ({MAX_PER_RUN}). Stopping.")
            break
            
        business = lead['business']
        owner = lead.get('owner_name','').strip()
        website = lead['website']
        
        email = find_email(website)
        if not email or '\n' in email or '\r' in email or ' ' in email:
            skip_count += 1
            continue
        if email.lower() in sent:
            skip_count += 1
            continue
        
        if owner:
            subject = SUBJECT_OWNER.format(owner=owner.split()[0], business=business)
            greeting = f"{owner.split()[0]},"
        else:
            subject = SUBJECT_NO_OWNER.format(business=business)
            greeting = f"Hey,"
        
        body = BODY_TEMPLATE.format(greeting=greeting, business=business)
        
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
                f.write(email.lower() + '\n')
            sent.add(email.lower())
            sent_count += 1
            tier = lead.get('tier','')
            print(f"[{sent_count}] SENT ({tier}): {business} -> {email}")
            time.sleep(4)  # Rate limit: ~15/min, well under Gmail limits
        except Exception as e:
            fail_count += 1
            print(f"FAIL: {business} ({email}) - {str(e)[:80]}")
            if 'Daily user sending quota exceeded' in str(e):
                print("Gmail quota hit. Stopping.")
                break
            time.sleep(2)
    
    print(f"\nDone: {sent_count} sent, {fail_count} failed, {skip_count} skipped")

if __name__ == '__main__':
    main()
