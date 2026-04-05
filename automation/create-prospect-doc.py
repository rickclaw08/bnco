#!/usr/bin/env python3
"""Create Google Doc with prospect dossiers + call scripts, share with Brand."""

import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SA_KEY = "/Users/agentclaw/.openclaw/workspace/automation/gcloud-service-account.json"
SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
]
SHARE_EMAIL = "jacksonroy152@gmail.com"
OWNER_EMAIL = "rickclaw08@gmail.com"

creds = service_account.Credentials.from_service_account_file(SA_KEY, scopes=SCOPES)

docs_service = build("docs", "v1", credentials=creds)
drive_service = build("drive", "v3", credentials=creds)

# --- Read source files ---
with open("/Users/agentclaw/.openclaw/workspace/velocity_root/research/prospect-dossiers.md", "r") as f:
    dossiers_text = f.read()

with open("/Users/agentclaw/.openclaw/workspace/velocity_root/research/choi-belfort-methodology.md", "r") as f:
    methodology_text = f.read()

# --- Create the doc ---
doc = docs_service.documents().create(body={
    "title": "Project Velocity - Prospect Playbook (April 2026)"
}).execute()
doc_id = doc["documentId"]
print(f"Doc created: {doc_id}")

# --- Build content ---
# Google Docs API inserts at index. We build the full text and insert it all at once.
# Then apply formatting in a second pass.

full_text = """PROJECT VELOCITY - PROSPECT PLAYBOOK
April 2026 | Hamilton County Sheriff Sales
Compiled by Rick | ClawOps

================================================================
PART 1: PROSPECT DOSSIERS
================================================================

""" + dossiers_text + """

================================================================
PART 2: SALES METHODOLOGY
The Choi-Belfort Hybrid Framework
================================================================

""" + methodology_text

# Google Docs API needs requests. Insert all text first.
requests = [
    {
        "insertText": {
            "location": {"index": 1},
            "text": full_text
        }
    }
]

# Apply formatting: title bold + larger
# Find the title line
title_end = full_text.index("\n") + 1  # "PROJECT VELOCITY - PROSPECT PLAYBOOK\n"

requests.append({
    "updateParagraphStyle": {
        "range": {"startIndex": 1, "endIndex": 1 + title_end},
        "paragraphStyle": {
            "namedStyleType": "HEADING_1",
            "alignment": "CENTER"
        },
        "fields": "namedStyleType,alignment"
    }
})

# Make subtitle
subtitle_start = 1 + title_end
subtitle_end_pos = full_text.index("\n", title_end + 1) + 1
requests.append({
    "updateParagraphStyle": {
        "range": {"startIndex": subtitle_start, "endIndex": 1 + subtitle_end_pos},
        "paragraphStyle": {
            "namedStyleType": "HEADING_3",
            "alignment": "CENTER"
        },
        "fields": "namedStyleType,alignment"
    }
})

# Find and format section headers (lines starting with ===)
import re
for match in re.finditer(r'^={3,}$', full_text, re.MULTILINE):
    pass  # Skip separator lines

# Find DOSSIER headers
for match in re.finditer(r'^## DOSSIER #\d+:.*$', full_text, re.MULTILINE):
    start = 1 + match.start()
    end = 1 + match.end() + 1
    requests.append({
        "updateParagraphStyle": {
            "range": {"startIndex": start, "endIndex": min(end, 1 + len(full_text))},
            "paragraphStyle": {"namedStyleType": "HEADING_2"},
            "fields": "namedStyleType"
        }
    })

# Find ### subheaders
for match in re.finditer(r'^### .+$', full_text, re.MULTILINE):
    start = 1 + match.start()
    end = 1 + match.end() + 1
    requests.append({
        "updateParagraphStyle": {
            "range": {"startIndex": start, "endIndex": min(end, 1 + len(full_text))},
            "paragraphStyle": {"namedStyleType": "HEADING_3"},
            "fields": "namedStyleType"
        }
    })

# Find ## headers (non-DOSSIER)
for match in re.finditer(r'^## (?!DOSSIER).+$', full_text, re.MULTILINE):
    start = 1 + match.start()
    end = 1 + match.end() + 1
    requests.append({
        "updateParagraphStyle": {
            "range": {"startIndex": start, "endIndex": min(end, 1 + len(full_text))},
            "paragraphStyle": {"namedStyleType": "HEADING_2"},
            "fields": "namedStyleType"
        }
    })

# Find # headers (top level, not ##)
for match in re.finditer(r'^# (?!#).+$', full_text, re.MULTILINE):
    start = 1 + match.start()
    end = 1 + match.end() + 1
    requests.append({
        "updateParagraphStyle": {
            "range": {"startIndex": start, "endIndex": min(end, 1 + len(full_text))},
            "paragraphStyle": {"namedStyleType": "HEADING_1"},
            "fields": "namedStyleType"
        }
    })

# Find PART 1/PART 2 section markers
for match in re.finditer(r'^PART \d+:.*$', full_text, re.MULTILINE):
    start = 1 + match.start()
    end = 1 + match.end() + 1
    requests.append({
        "updateParagraphStyle": {
            "range": {"startIndex": start, "endIndex": min(end, 1 + len(full_text))},
            "paragraphStyle": {"namedStyleType": "HEADING_1"},
            "fields": "namedStyleType"
        }
    })

# Bold **text** patterns - find and apply bold formatting
bold_ranges = []
for match in re.finditer(r'\*\*(.+?)\*\*', full_text):
    bold_ranges.append((1 + match.start(), 1 + match.end()))
    requests.append({
        "updateTextStyle": {
            "range": {"startIndex": 1 + match.start(), "endIndex": 1 + match.end()},
            "textStyle": {"bold": True},
            "fields": "bold"
        }
    })

# Execute all requests
if requests:
    docs_service.documents().batchUpdate(
        documentId=doc_id,
        body={"requests": requests}
    ).execute()
    print(f"Formatting applied ({len(requests)} requests)")

# --- Transfer ownership to rickclaw08 and share with jacksonroy ---
# First share with both emails as writer
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
print(f"Shared with {SHARE_EMAIL} as writer (with notification)")

# Also make it accessible via link
drive_service.permissions().create(
    fileId=doc_id,
    body={
        "type": "anyone",
        "role": "reader"
    }
).execute()
print("Link sharing enabled (anyone with link can view)")

doc_url = f"https://docs.google.com/document/d/{doc_id}/edit"
print(f"\nDOC URL: {doc_url}")
print("Done!")
