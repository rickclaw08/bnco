#!/bin/bash
# GHL Contact Deduplication Script
# Fetches all contacts, groups by phone, keeps oldest, deletes dupes

set -euo pipefail

TOKEN="pit-4a664329-2ae4-4b92-a44c-602cc7e2bc85"
LOCATION="Ez2ADxydpjvWsW3suYiq"
BASE="https://services.leadconnectorhq.com"
VERSION="2021-07-28"
OUTDIR="/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous"

# Step 1: Fetch ALL contacts with pagination
echo "=== STEP 1: Fetching all contacts ==="
ALL_CONTACTS="[]"
START_AFTER=""
PAGE=0

while true; do
  PAGE=$((PAGE + 1))
  URL="${BASE}/contacts/?locationId=${LOCATION}&limit=100"
  if [ -n "$START_AFTER" ]; then
    URL="${URL}&startAfterId=${START_AFTER}"
  fi
  
  echo "Fetching page ${PAGE}... (startAfter: ${START_AFTER:-none})"
  
  RESPONSE=$(curl -s -X GET "$URL" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Version: ${VERSION}" \
    -H "Accept: application/json")
  
  # Extract contacts from response
  CONTACTS=$(echo "$RESPONSE" | jq -r '.contacts // []')
  COUNT=$(echo "$CONTACTS" | jq 'length')
  
  echo "  Got ${COUNT} contacts on page ${PAGE}"
  
  if [ "$COUNT" -eq 0 ]; then
    echo "  No more contacts. Done fetching."
    break
  fi
  
  # Merge into ALL_CONTACTS
  ALL_CONTACTS=$(echo "$ALL_CONTACTS" "$CONTACTS" | jq -s '.[0] + .[1]')
  
  # Get next page cursor
  START_AFTER=$(echo "$RESPONSE" | jq -r '.meta.startAfterId // empty')
  
  if [ -z "$START_AFTER" ]; then
    echo "  No more pages (no startAfterId). Done fetching."
    break
  fi
  
  sleep 0.2
done

TOTAL_BEFORE=$(echo "$ALL_CONTACTS" | jq 'length')
echo ""
echo "=== Total contacts fetched: ${TOTAL_BEFORE} ==="

# Save raw contacts
echo "$ALL_CONTACTS" > "${OUTDIR}/all_contacts_raw.json"

# Step 2: Group by phone, identify dupes
echo ""
echo "=== STEP 2: Grouping by phone number and identifying duplicates ==="

# Use jq to group by phone and pick oldest per group
# Also flag bad leads
python3 << 'PYTHON_SCRIPT'
import json
import sys
from collections import defaultdict
from datetime import datetime

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/all_contacts_raw.json") as f:
    contacts = json.load(f)

print(f"Total contacts loaded: {len(contacts)}")

# Group by phone
by_phone = defaultdict(list)
no_phone = []

for c in contacts:
    phone = (c.get("phone") or "").strip()
    if phone:
        by_phone[phone].append(c)
    else:
        no_phone.append(c)

print(f"Unique phone numbers: {len(by_phone)}")
print(f"Contacts without phone: {len(no_phone)}")

to_keep = []
to_delete = []

# For each phone group, keep oldest, delete rest
for phone, group in by_phone.items():
    # Sort by dateAdded ascending (oldest first)
    group.sort(key=lambda x: x.get("dateAdded", "9999"))
    to_keep.append(group[0])
    for dupe in group[1:]:
        to_delete.append({"id": dupe["id"], "reason": "duplicate", "phone": phone, "name": dupe.get("contactName", dupe.get("name", ""))})

# For contacts without phone, group by company name or email
by_name = defaultdict(list)
for c in no_phone:
    name = (c.get("contactName") or c.get("name") or c.get("companyName") or c.get("email") or c.get("id", "unknown")).strip().lower()
    by_name[name].append(c)

for name, group in by_name.items():
    group.sort(key=lambda x: x.get("dateAdded", "9999"))
    to_keep.append(group[0])
    for dupe in group[1:]:
        to_delete.append({"id": dupe["id"], "reason": "duplicate_no_phone", "phone": "", "name": dupe.get("contactName", dupe.get("name", ""))})

print(f"Contacts to keep (before bad lead removal): {len(to_keep)}")
print(f"Contacts to delete (duplicates): {len(to_delete)}")

# Step 3: Flag bad leads
bad_lead_ids = []
clean_keep = []
for c in to_keep:
    company = (c.get("companyName") or "").lower()
    phone = (c.get("phone") or "")
    name = (c.get("contactName") or c.get("name") or "").lower()
    
    is_bad = False
    reason = ""
    
    # Florida Home Air Conditioning
    if "florida home air" in company or "florida home air conditioning" in company:
        is_bad = True
        reason = "bad_lead_florida_home_ac"
    
    # Fake 555 numbers
    if "555" in phone:
        is_bad = True
        reason = "fake_555_number"
    
    if is_bad:
        to_delete.append({"id": c["id"], "reason": reason, "phone": phone, "name": c.get("contactName", c.get("name", ""))})
        bad_lead_ids.append(c["id"])
    else:
        clean_keep.append(c)

print(f"Bad leads identified: {len(bad_lead_ids)}")
print(f"Final contacts to keep: {len(clean_keep)}")
print(f"Total contacts to delete: {len(to_delete)}")

# Save results
with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/to_delete.json", "w") as f:
    json.dump(to_delete, f, indent=2)

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/to_keep.json", "w") as f:
    json.dump(clean_keep, f, indent=2)

# Save keep IDs for opportunity cleanup
keep_ids = set(c["id"] for c in clean_keep)
with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/keep_ids.json", "w") as f:
    json.dump(list(keep_ids), f)

print("\nFiles saved. Ready for deletion phase.")
PYTHON_SCRIPT

echo ""
echo "=== STEP 3: Deleting duplicate contacts ==="

# Read delete list and execute
TOTAL_TO_DELETE=$(cat "${OUTDIR}/to_delete.json" | jq 'length')
echo "Contacts to delete: ${TOTAL_TO_DELETE}"

DELETED=0
FAILED=0

for ID in $(cat "${OUTDIR}/to_delete.json" | jq -r '.[].id'); do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${BASE}/contacts/${ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Version: ${VERSION}" \
    -H "Accept: application/json")
  
  if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "204" ]; then
    DELETED=$((DELETED + 1))
  else
    FAILED=$((FAILED + 1))
    echo "  FAILED to delete ${ID} (HTTP ${RESPONSE})"
  fi
  
  TOTAL_DONE=$((DELETED + FAILED))
  if [ $((TOTAL_DONE % 25)) -eq 0 ]; then
    echo "  Progress: ${TOTAL_DONE}/${TOTAL_TO_DELETE} (deleted: ${DELETED}, failed: ${FAILED})"
  fi
  
  # Rate limiting delay
  sleep 0.15
done

echo ""
echo "Contact deletion complete: ${DELETED} deleted, ${FAILED} failed"

# Step 4: Opportunity cleanup
echo ""
echo "=== STEP 4: Cleaning up opportunities ==="

ALL_OPPS="[]"
OPP_PAGE=1

while true; do
  echo "Fetching opportunities page ${OPP_PAGE}..."
  
  RESPONSE=$(curl -s -X GET "${BASE}/opportunities/search?location_id=${LOCATION}&pipeline_id=MK59XHOAuRJU2IjgzHiq&page=${OPP_PAGE}&limit=100" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Version: ${VERSION}" \
    -H "Accept: application/json")
  
  OPPS=$(echo "$RESPONSE" | jq -r '.opportunities // []')
  COUNT=$(echo "$OPPS" | jq 'length')
  
  echo "  Got ${COUNT} opportunities on page ${OPP_PAGE}"
  
  if [ "$COUNT" -eq 0 ]; then
    break
  fi
  
  ALL_OPPS=$(echo "$ALL_OPPS" "$OPPS" | jq -s '.[0] + .[1]')
  OPP_PAGE=$((OPP_PAGE + 1))
  
  sleep 0.2
done

TOTAL_OPPS_BEFORE=$(echo "$ALL_OPPS" | jq 'length')
echo "Total opportunities fetched: ${TOTAL_OPPS_BEFORE}"

# Save opps
echo "$ALL_OPPS" > "${OUTDIR}/all_opps_raw.json"

# Identify opps to delete (orphaned contacts + duplicates per contact)
python3 << 'PYTHON_SCRIPT2'
import json
from collections import defaultdict

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/all_opps_raw.json") as f:
    opps = json.load(f)

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/keep_ids.json") as f:
    keep_ids = set(json.load(f))

print(f"Total opportunities: {len(opps)}")
print(f"Valid contact IDs: {len(keep_ids)}")

to_delete = []
to_keep = []

# Group by contactId
by_contact = defaultdict(list)
for o in opps:
    cid = o.get("contact", {}).get("id", "") if isinstance(o.get("contact"), dict) else o.get("contactId", "")
    if not cid:
        cid = o.get("contactId", "")
    by_contact[cid].append(o)

for cid, group in by_contact.items():
    if cid not in keep_ids:
        # Orphaned - delete all
        for o in group:
            to_delete.append({"id": o["id"], "reason": "orphaned_contact", "contactId": cid})
    else:
        # Keep oldest, delete dupes
        group.sort(key=lambda x: x.get("createdAt", x.get("dateAdded", "9999")))
        to_keep.append(group[0])
        for dupe in group[1:]:
            to_delete.append({"id": dupe["id"], "reason": "duplicate_opportunity", "contactId": cid})

print(f"Opportunities to keep: {len(to_keep)}")
print(f"Opportunities to delete: {len(to_delete)}")

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/opps_to_delete.json", "w") as f:
    json.dump(to_delete, f, indent=2)

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/opps_to_keep.json", "w") as f:
    json.dump(to_keep, f, indent=2)

PYTHON_SCRIPT2

TOTAL_OPPS_DELETE=$(cat "${OUTDIR}/opps_to_delete.json" | jq 'length')
echo ""
echo "Deleting ${TOTAL_OPPS_DELETE} opportunities..."

OPP_DELETED=0
OPP_FAILED=0

for ID in $(cat "${OUTDIR}/opps_to_delete.json" | jq -r '.[].id'); do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${BASE}/opportunities/${ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Version: ${VERSION}" \
    -H "Accept: application/json")
  
  if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "204" ]; then
    OPP_DELETED=$((OPP_DELETED + 1))
  else
    OPP_FAILED=$((OPP_FAILED + 1))
    echo "  FAILED to delete opp ${ID} (HTTP ${RESPONSE})"
  fi
  
  OPP_TOTAL_DONE=$((OPP_DELETED + OPP_FAILED))
  if [ $((OPP_TOTAL_DONE % 25)) -eq 0 ]; then
    echo "  Progress: ${OPP_TOTAL_DONE}/${TOTAL_OPPS_DELETE} (deleted: ${OPP_DELETED}, failed: ${OPP_FAILED})"
  fi
  
  sleep 0.15
done

echo ""
echo "Opportunity deletion complete: ${OPP_DELETED} deleted, ${OPP_FAILED} failed"

# Step 5: Generate final report
echo ""
echo "=== STEP 5: Generating final report ==="

CONTACTS_AFTER=$(cat "${OUTDIR}/to_keep.json" | jq 'length')
OPPS_AFTER=$(cat "${OUTDIR}/opps_to_keep.json" | jq 'length')

python3 << 'REPORT_SCRIPT'
import json
from datetime import datetime

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/to_keep.json") as f:
    contacts = json.load(f)

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/to_delete.json") as f:
    deleted = json.load(f)

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/all_contacts_raw.json") as f:
    all_raw = json.load(f)

# Try loading opp data
try:
    with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/all_opps_raw.json") as f:
        all_opps = json.load(f)
    with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/opps_to_delete.json") as f:
        opps_deleted = json.load(f)
    with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/opps_to_keep.json") as f:
        opps_kept = json.load(f)
except:
    all_opps = []
    opps_deleted = []
    opps_kept = []

report = f"""# GHL Contact Deduplication Report

**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M EDT')}
**Location:** Ez2ADxydpjvWsW3suYiq

---

## Summary

| Metric | Before | After | Deleted |
|--------|--------|-------|---------|
| Contacts | {len(all_raw)} | {len(contacts)} | {len(deleted)} |
| Opportunities | {len(all_opps)} | {len(opps_kept)} | {len(opps_deleted)} |

## Deletion Breakdown

### Contacts Deleted by Reason
"""

# Count by reason
reasons = {}
for d in deleted:
    r = d.get("reason", "unknown")
    reasons[r] = reasons.get(r, 0) + 1

for r, count in sorted(reasons.items()):
    report += f"- **{r}:** {count}\n"

report += f"""
### Bad Leads Removed
"""
bad = [d for d in deleted if d.get("reason") in ("bad_lead_florida_home_ac", "fake_555_number")]
if bad:
    for b in bad:
        report += f"- {b.get('name', 'Unknown')} | {b.get('phone', 'N/A')} | Reason: {b['reason']}\n"
else:
    report += "- None found matching criteria\n"

# Opp breakdown
if opps_deleted:
    opp_reasons = {}
    for d in opps_deleted:
        r = d.get("reason", "unknown")
        opp_reasons[r] = opp_reasons.get(r, 0) + 1
    
    report += "\n### Opportunities Deleted by Reason\n"
    for r, count in sorted(opp_reasons.items()):
        report += f"- **{r}:** {count}\n"

report += f"""
---

## Final Clean Contact List

| # | Company Name | Phone | City | State | Niche |
|---|-------------|-------|------|-------|-------|
"""

contacts.sort(key=lambda x: (x.get("companyName") or x.get("contactName") or "ZZZ").lower())

for i, c in enumerate(contacts, 1):
    company = c.get("companyName", "") or c.get("contactName", "") or c.get("name", "") or "N/A"
    phone = c.get("phone", "") or "N/A"
    city = c.get("city", "") or "N/A"
    state = c.get("state", "") or "N/A"
    # Try to get niche from tags or custom fields
    tags = c.get("tags", [])
    niche = ", ".join(tags) if tags else "N/A"
    
    # Clean pipe chars from fields
    company = company.replace("|", "/")
    city = city.replace("|", "/")
    state = state.replace("|", "/")
    niche = niche.replace("|", "/")
    
    report += f"| {i} | {company} | {phone} | {city} | {state} | {niche} |\n"

report += f"""
---

*Report generated automatically by deduplication script.*
"""

with open("/Users/agentclaw/.openclaw/workspace/claw-agency/ghl-autonomous/dedupe-report.md", "w") as f:
    f.write(report)

print(f"Report saved. {len(contacts)} clean contacts documented.")
REPORT_SCRIPT

echo ""
echo "=== DEDUPLICATION COMPLETE ==="
echo "Contacts: ${TOTAL_BEFORE} -> ${CONTACTS_AFTER} (deleted: ${DELETED})"
echo "Opportunities: ${TOTAL_OPPS_BEFORE} -> ${OPPS_AFTER} (deleted: ${OPP_DELETED})"
echo "Report saved to: ${OUTDIR}/dedupe-report.md"
