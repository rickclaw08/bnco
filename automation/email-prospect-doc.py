#!/usr/bin/env python3
"""Email the prospect playbook as HTML to Brand via Gmail SMTP."""

import smtplib
import os
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

GMAIL_USER = "rickclaw08@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
TO_EMAIL = "jacksonroy152@gmail.com"

# --- Read source files ---
with open("/Users/agentclaw/.openclaw/workspace/velocity_root/research/prospect-dossiers.md", "r") as f:
    dossiers_text = f.read()

with open("/Users/agentclaw/.openclaw/workspace/velocity_root/research/choi-belfort-methodology.md", "r") as f:
    methodology_text = f.read()

# --- Convert markdown to HTML ---
def apply_inline(text):
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    text = re.sub(r'`(.+?)`', r'<code style="background:#f5f5f5;padding:1px 4px;border-radius:2px;font-size:12px;">\1</code>', text)
    text = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', text)
    return text

def md_to_html(text):
    lines = text.split('\n')
    html_lines = []
    in_table = False
    in_code = False
    
    for line in lines:
        if line.strip().startswith('```'):
            if in_code:
                html_lines.append('</pre>')
                in_code = False
            else:
                html_lines.append('<pre style="background:#f5f5f5;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;white-space:pre-wrap;">')
                in_code = True
            continue
        
        if in_code:
            html_lines.append(line.replace('<', '&lt;').replace('>', '&gt;'))
            continue
        
        if '|' in line and not line.strip().startswith('#'):
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if cells and all(c.replace('-', '').replace(':', '') == '' for c in cells):
                continue
            if not in_table:
                html_lines.append('<table style="border-collapse:collapse;width:100%;margin:8px 0;">')
                in_table = True
                html_lines.append('<tr>')
                for cell in cells:
                    html_lines.append(f'<th style="border:1px solid #ddd;padding:6px 10px;background:#f0f0f0;text-align:left;font-size:13px;">{apply_inline(cell)}</th>')
                html_lines.append('</tr>')
                continue
            html_lines.append('<tr>')
            for cell in cells:
                html_lines.append(f'<td style="border:1px solid #ddd;padding:6px 10px;font-size:13px;">{apply_inline(cell)}</td>')
            html_lines.append('</tr>')
            continue
        else:
            if in_table:
                html_lines.append('</table>')
                in_table = False
        
        if line.startswith('#### '):
            html_lines.append(f'<h4 style="color:#444;margin:16px 0 6px;">{apply_inline(line[5:])}</h4>')
        elif line.startswith('### '):
            html_lines.append(f'<h3 style="color:#333;margin:20px 0 8px;border-bottom:1px solid #eee;padding-bottom:4px;">{apply_inline(line[4:])}</h3>')
        elif line.startswith('## DOSSIER'):
            html_lines.append(f'<h2 style="color:#1a5276;margin:30px 0 12px;border-bottom:2px solid #1a5276;padding-bottom:6px;">{apply_inline(line[3:])}</h2>')
        elif line.startswith('## '):
            html_lines.append(f'<h2 style="color:#2c3e50;margin:28px 0 10px;">{apply_inline(line[3:])}</h2>')
        elif line.startswith('# '):
            html_lines.append(f'<h1 style="color:#1a1a1a;margin:32px 0 14px;">{apply_inline(line[2:])}</h1>')
        elif line.strip() == '---':
            html_lines.append('<hr style="border:none;border-top:1px solid #ccc;margin:24px 0;">')
        elif line.strip().startswith('==='):
            html_lines.append('<hr style="border:none;border-top:3px solid #1a5276;margin:30px 0;">')
        elif line.strip().startswith('- '):
            indent = len(line) - len(line.lstrip())
            margin = indent * 10
            content = apply_inline(line.strip()[2:])
            html_lines.append(f'<div style="margin-left:{margin+20}px;padding:2px 0;font-size:14px;">&#8226; {content}</div>')
        elif re.match(r'^\d+\.\s+', line.strip()):
            m = re.match(r'^(\d+)\.\s+(.+)', line.strip())
            if m:
                html_lines.append(f'<div style="margin-left:20px;padding:2px 0;font-size:14px;">{m.group(1)}. {apply_inline(m.group(2))}</div>')
        elif line.strip() == '':
            html_lines.append('<br>')
        else:
            html_lines.append(f'<p style="margin:4px 0;font-size:14px;line-height:1.5;">{apply_inline(line)}</p>')
    
    if in_table: html_lines.append('</table>')
    if in_code: html_lines.append('</pre>')
    return '\n'.join(html_lines)

# --- Build HTML ---
html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:20px;color:#333;line-height:1.6;">

<div style="text-align:center;margin-bottom:40px;">
<h1 style="color:#1a5276;margin-bottom:4px;font-size:28px;">PROJECT VELOCITY - PROSPECT PLAYBOOK</h1>
<h3 style="color:#666;font-weight:normal;">April 2026 | Hamilton County Sheriff Sales</h3>
<p style="color:#999;font-size:13px;">Compiled by Rick | ClawOps</p>
</div>

<hr style="border:none;border-top:3px solid #1a5276;margin:30px 0;">
<h1 style="text-align:center;color:#1a5276;">PART 1: PROSPECT DOSSIERS</h1>
<p style="text-align:center;color:#666;font-size:13px;">7 Leads | April 8 + April 22 Auctions</p>
<hr style="border:none;border-top:1px solid #ccc;margin:20px 0 30px;">

{md_to_html(dossiers_text)}

<hr style="border:none;border-top:3px solid #1a5276;margin:40px 0 30px;">
<h1 style="text-align:center;color:#1a5276;">PART 2: SALES METHODOLOGY</h1>
<p style="text-align:center;color:#666;font-size:13px;">The Choi-Belfort Hybrid Framework</p>
<hr style="border:none;border-top:1px solid #ccc;margin:20px 0 30px;">

{md_to_html(methodology_text)}

</body></html>"""

# --- Create email ---
msg = MIMEMultipart('mixed')
msg['Subject'] = 'Project Velocity - Prospect Playbook (April 2026)'
msg['From'] = f'ClawOps <{GMAIL_USER}>'
msg['To'] = TO_EMAIL

# HTML body (viewable inline)
html_part = MIMEText(html_body, 'html', 'utf-8')
msg.attach(html_part)

# Also attach the raw HTML file for offline viewing
html_attachment = MIMEApplication(html_body.encode('utf-8'), _subtype='html')
html_attachment.add_header('Content-Disposition', 'attachment', filename='prospect-playbook-april2026.html')
msg.attach(html_attachment)

# --- Send ---
if not GMAIL_APP_PASSWORD:
    print("ERROR: GMAIL_APP_PASSWORD not set")
    exit(1)

with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
    server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
    server.send_message(msg)
    print(f"Email sent to {TO_EMAIL}")
    print("Subject: Project Velocity - Prospect Playbook (April 2026)")
    print("Content: Full HTML playbook (inline + attachment)")
    print("Done!")
