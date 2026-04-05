#!/usr/bin/env python3
"""Create Google Doc by uploading HTML via Drive API, share with Brand."""

import json
import re
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload

SA_KEY = "/Users/agentclaw/.openclaw/workspace/automation/gcloud-service-account.json"
SCOPES = [
    "https://www.googleapis.com/auth/drive",
]
SHARE_EMAIL = "jacksonroy152@gmail.com"
OWNER_EMAIL = "rickclaw08@gmail.com"

creds = service_account.Credentials.from_service_account_file(SA_KEY, scopes=SCOPES)
drive_service = build("drive", "v3", credentials=creds)

# --- Read source files ---
with open("/Users/agentclaw/.openclaw/workspace/velocity_root/research/prospect-dossiers.md", "r") as f:
    dossiers_text = f.read()

with open("/Users/agentclaw/.openclaw/workspace/velocity_root/research/choi-belfort-methodology.md", "r") as f:
    methodology_text = f.read()

# --- Convert markdown to HTML ---
def md_to_html(text):
    """Simple markdown to HTML converter for our specific format."""
    lines = text.split('\n')
    html_lines = []
    in_table = False
    in_code = False
    
    for line in lines:
        # Code blocks
        if line.strip().startswith('```'):
            if in_code:
                html_lines.append('</pre>')
                in_code = False
            else:
                html_lines.append('<pre style="background-color:#f5f5f5;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;white-space:pre-wrap;">')
                in_code = True
            continue
        
        if in_code:
            html_lines.append(line.replace('<', '&lt;').replace('>', '&gt;'))
            continue
        
        # Table handling
        if '|' in line and not line.strip().startswith('#'):
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if cells and all(c.replace('-', '').replace(':', '') == '' for c in cells):
                continue  # Skip separator row
            if not in_table:
                html_lines.append('<table style="border-collapse:collapse;width:100%;margin:8px 0;">')
                in_table = True
                # Check if this is header
                html_lines.append('<tr>')
                for cell in cells:
                    cell = apply_inline(cell)
                    html_lines.append(f'<th style="border:1px solid #ddd;padding:6px 10px;background-color:#f0f0f0;text-align:left;font-size:13px;">{cell}</th>')
                html_lines.append('</tr>')
                continue
            html_lines.append('<tr>')
            for cell in cells:
                cell = apply_inline(cell)
                html_lines.append(f'<td style="border:1px solid #ddd;padding:6px 10px;font-size:13px;">{cell}</td>')
            html_lines.append('</tr>')
            continue
        else:
            if in_table:
                html_lines.append('</table>')
                in_table = False
        
        # Headers
        if line.startswith('#### '):
            html_lines.append(f'<h4 style="color:#444;margin:16px 0 6px;">{apply_inline(line[5:])}</h4>')
            continue
        if line.startswith('### '):
            html_lines.append(f'<h3 style="color:#333;margin:20px 0 8px;border-bottom:1px solid #eee;padding-bottom:4px;">{apply_inline(line[4:])}</h3>')
            continue
        if line.startswith('## DOSSIER'):
            html_lines.append(f'<h2 style="color:#1a5276;margin:30px 0 12px;border-bottom:2px solid #1a5276;padding-bottom:6px;">{apply_inline(line[3:])}</h2>')
            continue
        if line.startswith('## '):
            html_lines.append(f'<h2 style="color:#2c3e50;margin:28px 0 10px;">{apply_inline(line[3:])}</h2>')
            continue
        if line.startswith('# '):
            html_lines.append(f'<h1 style="color:#1a1a1a;margin:32px 0 14px;">{apply_inline(line[2:])}</h1>')
            continue
        
        # Horizontal rule
        if line.strip() == '---':
            html_lines.append('<hr style="border:none;border-top:1px solid #ccc;margin:24px 0;">')
            continue
        
        # Separator lines
        if line.strip().startswith('==='):
            html_lines.append('<hr style="border:none;border-top:3px solid #1a5276;margin:30px 0;">')
            continue
        
        # List items
        if line.strip().startswith('- '):
            indent = len(line) - len(line.lstrip())
            margin = indent * 10
            content = apply_inline(line.strip()[2:])
            html_lines.append(f'<div style="margin-left:{margin + 20}px;padding:2px 0;font-size:14px;">&#8226; {content}</div>')
            continue
        
        # Numbered list
        m = re.match(r'^(\d+)\.\s+(.+)', line.strip())
        if m:
            content = apply_inline(m.group(2))
            html_lines.append(f'<div style="margin-left:20px;padding:2px 0;font-size:14px;">{m.group(1)}. {content}</div>')
            continue
        
        # Empty line
        if line.strip() == '':
            html_lines.append('<br>')
            continue
        
        # Regular paragraph
        html_lines.append(f'<p style="margin:4px 0;font-size:14px;line-height:1.5;">{apply_inline(line)}</p>')
    
    if in_table:
        html_lines.append('</table>')
    if in_code:
        html_lines.append('</pre>')
    
    return '\n'.join(html_lines)

def apply_inline(text):
    """Apply inline markdown formatting."""
    # Bold
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    # Italic
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    # Inline code
    text = re.sub(r'`(.+?)`', r'<code style="background-color:#f5f5f5;padding:1px 4px;border-radius:2px;font-size:12px;">\1</code>', text)
    # Links
    text = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', text)
    return text

# --- Build full HTML document ---
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {{
    font-family: 'Google Sans', Arial, sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 40px;
    color: #333;
    line-height: 1.6;
}}
h1 {{ font-size: 24px; }}
h2 {{ font-size: 20px; }}
h3 {{ font-size: 16px; }}
h4 {{ font-size: 14px; }}
</style>
</head>
<body>

<div style="text-align:center;margin-bottom:40px;">
<h1 style="color:#1a5276;margin-bottom:4px;font-size:28px;">PROJECT VELOCITY - PROSPECT PLAYBOOK</h1>
<h3 style="color:#666;font-weight:normal;">April 2026 | Hamilton County Sheriff Sales</h3>
<p style="color:#999;font-size:13px;">Compiled by Rick | ClawOps</p>
</div>

<hr style="border:none;border-top:3px solid #1a5276;margin:30px 0;">
<h1 style="text-align:center;color:#1a5276;">PART 1: PROSPECT DOSSIERS</h1>
<p style="text-align:center;color:#666;font-size:13px;">7 Leads | April 8 + April 22 Auctions | Full Profiles + Contact Sheets + Approach Strategies</p>
<hr style="border:none;border-top:1px solid #ccc;margin:20px 0 30px;">

{md_to_html(dossiers_text)}

<hr style="border:none;border-top:3px solid #1a5276;margin:40px 0 30px;">
<h1 style="text-align:center;color:#1a5276;">PART 2: SALES METHODOLOGY</h1>
<p style="text-align:center;color:#666;font-size:13px;">The Choi-Belfort Hybrid Framework | Cold Calling Distressed Homeowners</p>
<hr style="border:none;border-top:1px solid #ccc;margin:20px 0 30px;">

{md_to_html(methodology_text)}

</body>
</html>"""

# --- Upload as Google Doc ---
media = MediaInMemoryUpload(html.encode('utf-8'), mimetype='text/html')
file_metadata = {
    'name': 'Project Velocity - Prospect Playbook (April 2026)',
    'mimeType': 'application/vnd.google-apps.document',
}

file = drive_service.files().create(
    body=file_metadata,
    media_body=media,
    fields='id,webViewLink'
).execute()

doc_id = file['id']
doc_url = file.get('webViewLink', f'https://docs.google.com/document/d/{doc_id}/edit')
print(f"Doc created: {doc_id}")
print(f"URL: {doc_url}")

# --- Share with both emails ---
drive_service.permissions().create(
    fileId=doc_id,
    body={
        "type": "user",
        "role": "writer",
        "emailAddress": OWNER_EMAIL
    },
    sendNotificationEmail=False,
    transferOwnership=False
).execute()
print(f"Shared with {OWNER_EMAIL} as writer")

drive_service.permissions().create(
    fileId=doc_id,
    body={
        "type": "user",
        "role": "writer",
        "emailAddress": SHARE_EMAIL
    },
    sendNotificationEmail=True,
    emailMessage="Your Project Velocity Prospect Playbook is ready. All 7 prospect dossiers + Choi-Belfort call scripts inside."
).execute()
print(f"Shared with {SHARE_EMAIL} as writer (with email notification)")

# Also make link-accessible
drive_service.permissions().create(
    fileId=doc_id,
    body={
        "type": "anyone",
        "role": "reader"
    }
).execute()
print("Link sharing enabled")

print(f"\nFINAL URL: {doc_url}")
print("Done!")
