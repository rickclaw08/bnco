#!/usr/bin/env python3
"""GHL Contact Deduplication - Phase 2: Full fetch with correct pagination"""

import subprocess
import json
import time
import sys
from collections import defaultdict
from datetime import datetime
from urllib.parse import urlparse, parse_qs

TOKEN = "pit-4a664329-2ae4-4b92-a44c-602cc7e2bc85"
LOCATION = "Ez2ADxydpjvWsW3suYiq"
BASE = "https://services.leadconnectorhq.com"
VERSION = "2021-07-28"
OUTDIR = "/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous"
PIPELINE = "MK59XHOAuRJU2IjgzHiq"

def api_get(url):
    """Make GET request to GHL API with full URL"""
    if not url.startswith("http"):
        url = f"{BASE}{url}"
    
    cmd = [
        "curl", "-s", "-X", "GET", url,
        "-H", f"Authorization: Bearer {TOKEN}",
        "-H", f"Version: {VERSION}",
        "-H", "Accept: application/json"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        print(f"  ERROR: Failed to parse JSON: {result.stdout[:300]}")
        return None

def api_delete(path):
    """Make DELETE request to GHL API"""
    url = f"{BASE}{path}"
    cmd = [
        "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
        "-X", "DELETE", url,
        "-H", f"Authorization: Bearer {TOKEN}",
        "-H", f"Version: {VERSION}",
        "-H", "Accept: application/json"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return result.stdout.strip()

# ============================================================
# STEP 1: Fetch ALL contacts using nextPageUrl
# ============================================================
print("=== STEP 1: Fetching all contacts ===")
all_contacts = {}
next_url = f"{BASE}/contacts/?locationId={LOCATION}&limit=100"
page = 0

while next_url:
    page += 1
    resp = api_get(next_url)
    
    if not resp or "contacts" not in resp:
        print(f"  Page {page}: No valid response. Stopping.")
        break
    
    contacts = resp["contacts"]
    if not contacts:
        print(f"  Page {page}: Empty. Done.")
        break
    
    new = 0
    for c in contacts:
        cid = c.get("id")
        if cid and cid not in all_contacts:
            all_contacts[cid] = c
            new += 1
    
    meta = resp.get("meta", {})
    total_api = meta.get("total", "?")
    print(f"  Page {page}: {len(contacts)} returned, {new} new (total unique: {len(all_contacts)}, API total: {total_api})")
    
    # Use nextPageUrl for proper pagination
    next_url = meta.get("nextPageUrl")
    if next_url and not next_url.startswith("http"):
        next_url = f"{BASE}{next_url}"
    
    # If we've got all contacts according to API total
    if isinstance(total_api, int) and len(all_contacts) >= total_api:
        print(f"  Reached API total ({total_api}). Done.")
        break
    
    # If page returned fewer than limit, we're done
    if len(contacts) < 100:
        print(f"  Last page (< 100 results). Done.")
        break
    
    time.sleep(0.2)

contacts_list = list(all_contacts.values())
TOTAL_BEFORE = len(contacts_list)
print(f"\n=== Total unique contacts fetched: {TOTAL_BEFORE} ===")

with open(f"{OUTDIR}/all_contacts_raw.json", "w") as f:
    json.dump(contacts_list, f)

# ============================================================
# STEP 2: Group by phone, identify duplicates
# ============================================================
print("\n=== STEP 2: Grouping by phone number ===")

by_phone = defaultdict(list)
no_phone = []

for c in contacts_list:
    phone = (c.get("phone") or "").strip()
    if phone:
        by_phone[phone].append(c)
    else:
        no_phone.append(c)

print(f"Unique phone numbers: {len(by_phone)}")
print(f"Contacts without phone: {len(no_phone)}")

to_keep = []
to_delete = []

for phone, group in by_phone.items():
    group.sort(key=lambda x: x.get("dateAdded", "9999"))
    to_keep.append(group[0])
    for dupe in group[1:]:
        to_delete.append({
            "id": dupe["id"],
            "reason": "duplicate",
            "phone": phone,
            "name": dupe.get("contactName") or dupe.get("name") or ""
        })

# No-phone contacts
by_key = defaultdict(list)
for c in no_phone:
    key = (c.get("contactName") or c.get("name") or c.get("companyName") or c.get("email") or c.get("id")).strip().lower()
    by_key[key].append(c)

for key, group in by_key.items():
    group.sort(key=lambda x: x.get("dateAdded", "9999"))
    to_keep.append(group[0])
    for dupe in group[1:]:
        to_delete.append({
            "id": dupe["id"],
            "reason": "duplicate_no_phone",
            "phone": "",
            "name": dupe.get("contactName") or dupe.get("name") or ""
        })

print(f"Contacts to keep (before bad lead check): {len(to_keep)}")
print(f"Duplicate contacts to delete: {len(to_delete)}")

# ============================================================
# STEP 3: Flag bad leads
# ============================================================
print("\n=== STEP 3: Flagging bad leads ===")

bad_leads = []
clean_keep = []

for c in to_keep:
    company = (c.get("companyName") or "").lower()
    phone = (c.get("phone") or "")
    name = (c.get("contactName") or c.get("name") or "").lower()
    
    is_bad = False
    reason = ""
    
    if "florida home air" in company:
        is_bad = True
        reason = "bad_lead_florida_home_ac"
    
    if "555" in phone:
        is_bad = True
        reason = "fake_555_number"
    
    if is_bad:
        to_delete.append({
            "id": c["id"],
            "reason": reason,
            "phone": phone,
            "name": c.get("contactName") or c.get("name") or company
        })
        bad_leads.append(c)
        print(f"  Bad lead: {company or name} | {phone} | {reason}")
    else:
        clean_keep.append(c)

print(f"Bad leads found: {len(bad_leads)}")
print(f"Final contacts to keep: {len(clean_keep)}")
print(f"Total to delete: {len(to_delete)}")

# Save
with open(f"{OUTDIR}/to_keep.json", "w") as f:
    json.dump(clean_keep, f, indent=2)
with open(f"{OUTDIR}/to_delete.json", "w") as f:
    json.dump(to_delete, f, indent=2)

keep_ids = set(c["id"] for c in clean_keep)
with open(f"{OUTDIR}/keep_ids.json", "w") as f:
    json.dump(list(keep_ids), f)

# ============================================================
# STEP 4: Delete contacts
# ============================================================
if to_delete:
    print(f"\n=== STEP 4: Deleting {len(to_delete)} contacts ===")
    
    deleted_count = 0
    failed_count = 0
    
    for i, d in enumerate(to_delete):
        status = api_delete(f"/contacts/{d['id']}")
        
        if status in ("200", "204"):
            deleted_count += 1
        else:
            failed_count += 1
            if failed_count <= 10:
                print(f"  FAILED: {d['id']} (HTTP {status}) - {d.get('name', '')}")
        
        if (i + 1) % 25 == 0:
            print(f"  Progress: {i+1}/{len(to_delete)} (deleted: {deleted_count}, failed: {failed_count})")
        
        time.sleep(0.15)
    
    print(f"\nContact deletion complete: {deleted_count} deleted, {failed_count} failed")
else:
    deleted_count = 0
    failed_count = 0
    print("\n=== STEP 4: No contacts to delete ===")

# ============================================================
# STEP 5: Fetch opportunities
# ============================================================
print("\n=== STEP 5: Fetching opportunities ===")

all_opps = []
opp_page = 1

while True:
    url = f"{BASE}/opportunities/search?location_id={LOCATION}&pipeline_id={PIPELINE}&page={opp_page}&limit=100"
    resp = api_get(url)
    
    if not resp:
        break
    
    opps = resp.get("opportunities", [])
    print(f"  Page {opp_page}: {len(opps)} opportunities")
    
    if not opps:
        break
    
    all_opps.extend(opps)
    
    meta = resp.get("meta", {})
    total = meta.get("total", 0)
    if len(all_opps) >= total or len(opps) < 100:
        break
    
    opp_page += 1
    time.sleep(0.2)

TOTAL_OPPS_BEFORE = len(all_opps)
print(f"Total opportunities: {TOTAL_OPPS_BEFORE}")

with open(f"{OUTDIR}/all_opps_raw.json", "w") as f:
    json.dump(all_opps, f)

# Identify orphaned/duplicate opps
opps_to_delete = []
opps_to_keep = []

by_contact = defaultdict(list)
for o in all_opps:
    contact = o.get("contact", {})
    cid = contact.get("id", "") if isinstance(contact, dict) else ""
    if not cid:
        cid = o.get("contactId", "")
    by_contact[cid].append(o)

for cid, group in by_contact.items():
    if cid not in keep_ids:
        for o in group:
            opps_to_delete.append({"id": o["id"], "reason": "orphaned_contact", "contactId": cid})
    else:
        group.sort(key=lambda x: x.get("createdAt") or x.get("dateAdded") or "9999")
        opps_to_keep.append(group[0])
        for dupe in group[1:]:
            opps_to_delete.append({"id": dupe["id"], "reason": "duplicate_opportunity", "contactId": cid})

print(f"Opportunities to keep: {len(opps_to_keep)}")
print(f"Opportunities to delete: {len(opps_to_delete)}")

with open(f"{OUTDIR}/opps_to_delete.json", "w") as f:
    json.dump(opps_to_delete, f, indent=2)
with open(f"{OUTDIR}/opps_to_keep.json", "w") as f:
    json.dump(opps_to_keep, f, indent=2)

# Delete opps
if opps_to_delete:
    print(f"\n=== STEP 6: Deleting {len(opps_to_delete)} opportunities ===")
    
    opp_deleted = 0
    opp_failed = 0
    
    for i, d in enumerate(opps_to_delete):
        status = api_delete(f"/opportunities/{d['id']}")
        
        if status in ("200", "204"):
            opp_deleted += 1
        else:
            opp_failed += 1
            if opp_failed <= 10:
                print(f"  FAILED: opp {d['id']} (HTTP {status})")
        
        if (i + 1) % 25 == 0:
            print(f"  Progress: {i+1}/{len(opps_to_delete)} (deleted: {opp_deleted}, failed: {opp_failed})")
        
        time.sleep(0.15)
    
    print(f"\nOpportunity deletion complete: {opp_deleted} deleted, {opp_failed} failed")
else:
    opp_deleted = 0
    opp_failed = 0
    print("\n=== STEP 6: No opportunities to delete ===")

# ============================================================
# STEP 7: Generate report
# ============================================================
print("\n=== STEP 7: Generating report ===")

contact_reasons = defaultdict(int)
for d in to_delete:
    contact_reasons[d["reason"]] += 1

opp_reasons = defaultdict(int)
for d in opps_to_delete:
    opp_reasons[d["reason"]] += 1

report = f"""# GHL Contact Deduplication Report

**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M EDT')}  
**Location:** {LOCATION}

---

## Summary

| Metric | Before | After | Deleted | Failed |
|--------|--------|-------|---------|--------|
| Contacts | {TOTAL_BEFORE} | {len(clean_keep)} | {deleted_count} | {failed_count} |
| Opportunities | {TOTAL_OPPS_BEFORE} | {len(opps_to_keep)} | {opp_deleted} | {opp_failed} |

## Contact Deletion Breakdown

"""

for reason, count in sorted(contact_reasons.items()):
    report += f"- **{reason}:** {count}\n"

report += "\n## Bad Leads Removed\n\n"
if bad_leads:
    for b in bad_leads:
        company = b.get("companyName") or b.get("contactName") or "Unknown"
        phone = b.get("phone") or "N/A"
        report += f"- {company} - {phone}\n"
else:
    report += "- None found matching criteria\n"

if opps_to_delete:
    report += "\n## Opportunity Deletion Breakdown\n\n"
    for reason, count in sorted(opp_reasons.items()):
        report += f"- **{reason}:** {count}\n"

report += f"""
---

## Final Clean Contact List ({len(clean_keep)} contacts)

| # | Company Name | Phone | City | State | Niche |
|---|-------------|-------|------|-------|-------|
"""

clean_keep.sort(key=lambda x: (x.get("companyName") or x.get("contactName") or "ZZZ").lower())

for i, c in enumerate(clean_keep, 1):
    company = (c.get("companyName") or c.get("contactName") or c.get("name") or "N/A").replace("|", "/")
    phone = (c.get("phone") or "N/A").replace("|", "/")
    city = (c.get("city") or "N/A").replace("|", "/")
    state = (c.get("state") or "N/A").replace("|", "/")
    tags = c.get("tags", [])
    niche = ", ".join(tags).replace("|", "/") if tags else "N/A"
    report += f"| {i} | {company} | {phone} | {city} | {state} | {niche} |\n"

report += "\n---\n\n*Report generated automatically by deduplication script.*\n"

with open(f"{OUTDIR}/dedupe-report.md", "w") as f:
    f.write(report)

print(f"\n{'='*60}")
print(f"DEDUPLICATION COMPLETE")
print(f"{'='*60}")
print(f"Contacts: {TOTAL_BEFORE} -> {len(clean_keep)} (deleted: {deleted_count}, failed: {failed_count})")
print(f"Opportunities: {TOTAL_OPPS_BEFORE} -> {len(opps_to_keep)} (deleted: {opp_deleted}, failed: {opp_failed})")
print(f"Report: {OUTDIR}/dedupe-report.md")
