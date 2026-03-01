#!/usr/bin/env python3
"""Send queued emails from Feb 23 that hit Gmail daily limit."""
import smtplib, os, time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

gmail_user = "rickclaw08@gmail.com"
gmail_pass = os.environ.get("GMAIL_APP_PASSWORD", "fuouipgnupmddfyh")

leads = [
    {
        "company": "Gulfshore Air Conditioning",
        "email": "gulfshore@gulfshoreair.com",
        "role": "office administrator",
        "industry": "HVAC",
        "process": "scheduling and dispatch coordination"
    },
    {
        "company": "Bahia Property Management",
        "email": "info@orlandopropertymanagement.com",
        "role": "administrative assistant",
        "industry": "property management",
        "process": "tenant communication and maintenance request routing"
    },
    {
        "company": "Realty Advisors",
        "email": "mail@realtyadvisors.com",
        "role": "operations coordinator",
        "industry": "real estate",
        "process": "lead follow-up and client onboarding"
    },
    {
        "company": "Vick and Grohman CPAs",
        "email": "info@dallascpafirm.com",
        "role": "administrative assistant",
        "industry": "accounting",
        "process": "document collection and client intake"
    },
    {
        "company": "Abacus Plumbing, AC & Electric",
        "email": "customerservice@abacusplumbing.net",
        "role": "customer service coordinator",
        "industry": "HVAC/plumbing",
        "process": "service request intake and appointment scheduling"
    }
]

server = smtplib.SMTP("smtp.gmail.com", 587)
server.starttls()
server.login(gmail_user, gmail_pass)

sent = 0
failed = 0
for lead in leads:
    subject = f"Alternative to hiring a {lead['role']}"
    body = f"""Hi {lead['company']} Team,

I noticed you're looking for a {lead['role']}. Before you commit to a $45-55K/year salary plus benefits, it might be worth exploring whether automation could handle part of that workload.

We recently helped a {lead['industry']} company automate their {lead['process']}, saving them 15-20 hours per week. The whole project cost less than two months of a full-time salary.

Would a 15-minute call this week make sense? I can map out exactly what's automatable in your workflow and what's not.

Rick Claw
ClawOps | theclawops.com"""

    msg = MIMEMultipart()
    msg["From"] = f"Rick Claw <{gmail_user}>"
    msg["To"] = lead["email"]
    msg["Bcc"] = gmail_user
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server.sendmail(gmail_user, [lead["email"], gmail_user], msg.as_string())
        sent += 1
        print(f"SENT {sent}: {lead['company']} ({lead['email']})")
        if sent < len(leads):
            time.sleep(120)
    except Exception as e:
        failed += 1
        print(f"FAILED: {lead['company']} - {e}")

server.quit()
print(f"\nDone. {sent}/{len(leads)} sent, {failed} failed.")
