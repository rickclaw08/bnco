#!/usr/bin/env python3
"""GHL Full Export - curl-based with proper pagination."""
import json
import os
import re
import subprocess
import sys
import time

API_KEY = os.environ.get("GHL_API_KEY", "")
BASE = "https://services.leadconnectorhq.com"
LOC = "Ez2ADxydpjvWsW3suYiq"
OUT = os.path.dirname(os.path.abspath(__file__))

def sanitize(text):
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)

def api_get(path):
    url = f"{BASE}/{path}"
    result = subprocess.run(
        ["curl", "-s", "--connect-timeout", "10", "--max-time", "20", url,
         "-H", f"Authorization: Bearer {API_KEY}",
         "-H", "Version: 2021-07-28"],
        capture_output=True, text=True, timeout=25
    )
    raw = result.stdout
    if not raw:
        return None
    try:
        return json.loads(sanitize(raw))
    except json.JSONDecodeError as e:
        print(f"  JSON error: {e}", file=sys.stderr)
        return None

def save(name, data):
    path = os.path.join(OUT, f"{name}.json")
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"  -> {name}.json ({os.path.getsize(path):,} bytes)")

print(f"GHL Export | Location: {LOC} | {time.strftime('%Y-%m-%d %H:%M')}")
print("=" * 50)

# 1. Contacts (startAfterId pagination)
print("\n[1] Contacts...")
all_contacts = []
start_after_id = None
page = 0
while True:
    url = f"contacts/?locationId={LOC}&limit=100"
    if start_after_id:
        url += f"&startAfterId={start_after_id}"
    data = api_get(url)
    if not data:
        break
    batch = data.get("contacts", [])
    if not batch:
        break
    all_contacts.extend(batch)
    page += 1
    meta = data.get("meta", {})
    start_after_id = meta.get("startAfterId")
    print(f"  Page {page}: {len(batch)} (total: {len(all_contacts)}/{meta.get('total','?')})")
    sys.stdout.flush()
    if not start_after_id or len(batch) < 100:
        break
    # Safety cap: GHL API has a known bug where pagination loops infinitely
    if page >= 50:
        print(f"  WARNING: Hit 50 page cap. Stopping at {len(all_contacts)} contacts.")
        break
    time.sleep(0.3)
save("contacts", all_contacts)

# Deduplicate by contact ID
seen = set()
unique = []
for c in all_contacts:
    cid = c.get("id")
    if cid and cid not in seen:
        seen.add(cid)
        unique.append(c)
print(f"  Deduplicated: {len(all_contacts)} -> {len(unique)} unique contacts")
save("contacts", unique)
all_contacts = unique

# 2. Pipelines
print("\n[2] Pipelines...")
data = api_get(f"opportunities/pipelines?locationId={LOC}")
pipelines = data.get("pipelines", []) if data else []
save("pipelines", pipelines)

# 3. Opportunities
print("\n[3] Opportunities...")
all_opps = []
for p in pipelines:
    pid = p["id"]
    data = api_get(f"opportunities/search?locationId={LOC}&pipelineId={pid}&limit=100")
    if data and data.get("opportunities"):
        all_opps.extend(data["opportunities"])
        print(f"  '{p.get('name',pid)}': {len(data['opportunities'])}")
    time.sleep(0.3)
save("opportunities", all_opps)

# Simple endpoints
simple = {
    "calendars": f"calendars/?locationId={LOC}",
    "calendar-events": f"calendars/events?locationId={LOC}&startTime=2025-01-01T00:00:00Z&endTime=2026-12-31T23:59:59Z",
    "custom-fields": f"locations/{LOC}/customFields",
    "custom-values": f"locations/{LOC}/customValues",
    "tags": f"locations/{LOC}/tags",
    "users": f"users/search?locationId={LOC}",
    "workflows": f"workflows/?locationId={LOC}",
    "forms": f"forms/?locationId={LOC}",
    "funnels": f"funnels/?locationId={LOC}",
}

for i, (name, path) in enumerate(simple.items(), 4):
    print(f"\n[{i}] {name.title()}...")
    data = api_get(path)
    if data:
        # Try to find the list key
        for key in [name.replace("-",""), name.replace("-","_"), name, name.rstrip("s"), "data"]:
            if key in data:
                save(name, data[key])
                break
        else:
            # Save whole response
            save(name, data)
    else:
        save(name, [])
    time.sleep(0.3)

# Conversations (paginated)
print(f"\n[{len(simple)+4}] Conversations...")
all_convos = []
after = None
while True:
    url = f"conversations/search?locationId={LOC}&limit=100"
    if after:
        url += f"&startAfterId={after}"
    data = api_get(url)
    if not data:
        break
    batch = data.get("conversations", [])
    if not batch:
        break
    all_convos.extend(batch)
    print(f"  Batch: {len(batch)} (total: {len(all_convos)})")
    sys.stdout.flush()
    after = batch[-1].get("id")
    if len(batch) < 100:
        break
    if len(all_convos) >= 5000:
        print(f"  WARNING: Hit 5000 conversation cap.")
        break
    time.sleep(0.3)
# Deduplicate conversations
seen_c = set()
unique_c = []
for c in all_convos:
    cid = c.get("id")
    if cid and cid not in seen_c:
        seen_c.add(cid)
        unique_c.append(c)
print(f"  Deduplicated: {len(all_convos)} -> {len(unique_c)} unique conversations")
save("conversations", unique_c)

# Summary
print("\n" + "=" * 50)
print("EXPORT COMPLETE")
print("=" * 50)
total_size = 0
for f in sorted(os.listdir(OUT)):
    if f.endswith(".json"):
        sz = os.path.getsize(os.path.join(OUT, f))
        total_size += sz
        try:
            with open(os.path.join(OUT, f)) as fh:
                d = json.load(fh)
                count = len(d) if isinstance(d, list) else "obj"
        except:
            count = "?"
        print(f"  {f}: {sz:,} bytes ({count})")
print(f"\nTotal: {total_size:,} bytes | Dir: {OUT}/")
