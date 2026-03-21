#!/usr/bin/env python3
"""
Fix C: Tag the 63 pain-signal leads in GHL with 'pain-signal-priority'.
Matches on phone number. Preserves existing tags (appends only).
"""

import csv
import os
import time
import requests

# --- CONFIG ---
GHL_API_KEY = os.environ.get("GHL_API_KEY", "pit-4a664329-2ae4-4b92-a44c-602cc7e2bc85")
LOCATION_ID = "Ez2ADxydpjvWsW3suYiq"
BASE_URL = "https://services.leadconnectorhq.com"
HEADERS = {
    "Authorization": f"Bearer {GHL_API_KEY}",
    "Version": "2021-07-28",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

TAG_NAME = "pain-signal-priority"
CSV_PATH = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/verified-pain-leads-deduped.csv"


def normalize_phone(phone):
    """Strip to digits, ensure +1 prefix."""
    if not phone:
        return None
    digits = "".join(c for c in str(phone) if c.isdigit())
    if len(digits) == 10:
        digits = "1" + digits
    if len(digits) == 11 and digits.startswith("1"):
        return "+" + digits
    return None


def fetch_all_contacts():
    """Fetch all contacts from GHL using cursor-based pagination."""
    contacts = []
    limit = 100
    start_after = None
    start_after_id = None
    while True:
        url = f"{BASE_URL}/contacts/?locationId={LOCATION_ID}&limit={limit}"
        if start_after and start_after_id:
            url += f"&startAfter={start_after}&startAfterId={start_after_id}"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 429:
            retry = int(resp.headers.get("Retry-After", 5))
            print(f"  Rate limited, waiting {retry}s...")
            time.sleep(retry)
            continue
        resp.raise_for_status()
        data = resp.json()
        batch = data.get("contacts", [])
        if not batch:
            break
        contacts.extend(batch)
        meta = data.get("meta", {})
        start_after = meta.get("startAfter")
        start_after_id = meta.get("startAfterId")
        if not start_after or not start_after_id:
            break
        time.sleep(0.3)
    return contacts


def add_tag(contact_id, tag):
    """Add a tag to a GHL contact (appends, doesn't overwrite)."""
    url = f"{BASE_URL}/contacts/{contact_id}/tags"
    resp = requests.post(url, headers=HEADERS, json={"tags": [tag]})
    if resp.status_code == 429:
        retry = int(resp.headers.get("Retry-After", 5))
        print(f"  Rate limited, waiting {retry}s...")
        time.sleep(retry)
        resp = requests.post(url, headers=HEADERS, json={"tags": [tag]})
    return resp


def main():
    print("=" * 60)
    print("Fix C: Tag Pain-Signal Priority Leads")
    print("=" * 60)

    # Load pain leads CSV
    print(f"\nLoading {CSV_PATH}...")
    pain_phones = set()
    pain_data = {}
    with open(CSV_PATH, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            phone = normalize_phone(row.get("Phone", ""))
            if phone:
                pain_phones.add(phone)
                pain_data[phone] = {
                    "business": row.get("Business Name", ""),
                    "city": row.get("City", ""),
                    "niche": row.get("Niche", ""),
                    "pain_score": row.get("Pain Score", ""),
                }
    print(f"  Pain-signal leads loaded: {len(pain_phones)}")

    # Fetch all GHL contacts
    print("\nFetching GHL contacts...")
    contacts = fetch_all_contacts()
    print(f"  Total GHL contacts: {len(contacts)}")

    # Build phone -> contact mapping
    phone_to_contact = {}
    for c in contacts:
        phone = normalize_phone(c.get("phone", ""))
        if phone:
            phone_to_contact[phone] = c

    # Match and tag
    matched = pain_phones & set(phone_to_contact.keys())
    unmatched = pain_phones - set(phone_to_contact.keys())

    print(f"\n  Matched in GHL: {len(matched)}")
    print(f"  Not in GHL: {len(unmatched)}")

    tagged = 0
    already_tagged = 0
    errored = 0

    print(f"\nTagging with '{TAG_NAME}'...")
    print("-" * 60)

    for phone in sorted(matched):
        contact = phone_to_contact[phone]
        contact_id = contact["id"]
        info = pain_data.get(phone, {})

        # Check if already tagged
        existing_tags = [t.strip().lower() for t in (contact.get("tags") or [])]
        if TAG_NAME in existing_tags:
            already_tagged += 1
            continue

        try:
            resp = add_tag(contact_id, TAG_NAME)
            if resp.status_code in (200, 201):
                print(f"  TAGGED {contact_id}: {info.get('business', 'unknown')} ({info.get('city', '')}, {info.get('niche', '')}) score={info.get('pain_score', '?')}")
                tagged += 1
            else:
                print(f"  ERROR {contact_id}: {resp.status_code} {resp.text[:100]}")
                errored += 1
        except Exception as e:
            print(f"  ERROR {contact_id}: {e}")
            errored += 1

        time.sleep(0.3)

    if unmatched:
        print(f"\n  Unmatched phones (not in GHL):")
        for phone in sorted(unmatched):
            info = pain_data.get(phone, {})
            print(f"    {phone}: {info.get('business', 'unknown')}")

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Tagged:          {tagged}")
    print(f"  Already tagged:  {already_tagged}")
    print(f"  Not in GHL:      {len(unmatched)}")
    print(f"  Errors:          {errored}")
    print("=" * 60)


if __name__ == "__main__":
    main()
