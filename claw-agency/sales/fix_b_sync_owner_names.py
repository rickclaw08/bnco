#!/usr/bin/env python3
"""
Fix B: Sync owner names, company names, and niche tags from enriched CSVs to GHL contacts.
Matches on phone number. Skips contacts that already have a real first name in GHL.
"""

import csv
import os
import sys
import time
import requests

# --- CONFIG ---
GHL_API_KEY = os.environ.get("GHL_API_KEY", "pit-4a664329-2ae4-4b92-a44c-602cc7e2bc85")
LOCATION_ID = "Ez2ADxydpjvWsW3suYiq"
NICHE_FIELD_ID = "F7txi11mIuhx3qbh1tKB"
BASE_URL = "https://services.leadconnectorhq.com"
HEADERS = {
    "Authorization": f"Bearer {GHL_API_KEY}",
    "Version": "2021-07-28",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

# Column mapping for CSVs
COLUMN_MAP_MEGA = {
    "business_name": "Business Name",
    "phone": "Phone",
    "owner_name": "Owner_Name",
    "niche": "Niche",
}
COLUMN_MAP_WAVE2 = {
    "business_name": "Business Name",
    "phone": "Phone",
    "owner_name": "Owner_Name",
    "niche": "Niche",
}

# Niche value normalization
NICHE_MAP = {
    "hvac": "HVAC",
    "plumbing": "Plumbing",
    "electrical": "Electrical",
    "roofing": "Roofing",
    "general contractor": "General Contractor",
    "gc": "General Contractor",
    "landscaping": "Landscaping",
}

CSV_DIR = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales"


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


def split_name(full_name):
    """Split 'First Last' into (first, last)."""
    parts = full_name.strip().split()
    if len(parts) == 0:
        return None, None
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def normalize_niche(raw):
    """Normalize niche string to standard values."""
    if not raw:
        return None
    key = raw.strip().lower()
    return NICHE_MAP.get(key, raw.strip())


def load_csv_data(filepath, col_map):
    """Load enriched CSV, return dict of phone -> {owner, company, niche}."""
    data = {}
    with open(filepath, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            phone = normalize_phone(row.get(col_map["phone"], ""))
            owner = row.get(col_map["owner_name"], "").strip()
            company = row.get(col_map["business_name"], "").strip()
            niche = row.get(col_map["niche"], "").strip()
            if phone and (owner or company or niche):
                data[phone] = {
                    "owner_name": owner,
                    "company": company,
                    "niche": niche,
                }
    return data


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
        print(f"  Fetched {len(contacts)} contacts so far...")
        if not start_after or not start_after_id:
            break
        time.sleep(0.3)
    return contacts


def update_contact(contact_id, payload):
    """Update a single GHL contact."""
    url = f"{BASE_URL}/contacts/{contact_id}"
    resp = requests.put(url, headers=HEADERS, json=payload)
    if resp.status_code == 429:
        retry = int(resp.headers.get("Retry-After", 5))
        print(f"  Rate limited, waiting {retry}s...")
        time.sleep(retry)
        resp = requests.put(url, headers=HEADERS, json=payload)
    return resp


def add_tag(contact_id, tag):
    """Add a tag to a GHL contact."""
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
    print("Fix B: Sync Owner Names + Niche to GHL Contacts")
    print("=" * 60)

    # Load CSV data
    print("\nLoading CSVs...")
    csv_data = {}

    mega_path = os.path.join(CSV_DIR, "mega-lead-scrape-enriched.csv")
    if os.path.exists(mega_path):
        mega = load_csv_data(mega_path, COLUMN_MAP_MEGA)
        csv_data.update(mega)
        print(f"  mega-lead-scrape-enriched.csv: {len(mega)} records with data")

    wave2_path = os.path.join(CSV_DIR, "fresh-leads-wave2-enriched.csv")
    if os.path.exists(wave2_path):
        wave2 = load_csv_data(wave2_path, COLUMN_MAP_WAVE2)
        csv_data.update(wave2)
        print(f"  fresh-leads-wave2-enriched.csv: {len(wave2)} records with data")

    print(f"\nTotal CSV records with enrichment data: {len(csv_data)}")

    # Fetch all GHL contacts
    print("\nFetching GHL contacts...")
    contacts = fetch_all_contacts()
    print(f"Total GHL contacts: {len(contacts)}")

    # Build phone -> contact mapping
    phone_to_contact = {}
    for c in contacts:
        phone = normalize_phone(c.get("phone", ""))
        if phone:
            phone_to_contact[phone] = c

    # Match and update
    updated = 0
    skipped_has_name = 0
    skipped_no_match = 0
    errored = 0
    niche_tagged = 0

    csv_phones = set(csv_data.keys())
    ghl_phones = set(phone_to_contact.keys())
    matched_phones = csv_phones & ghl_phones

    print(f"\nCSV phones: {len(csv_phones)}")
    print(f"GHL phones: {len(ghl_phones)}")
    print(f"Matched: {len(matched_phones)}")
    print(f"\nProcessing updates...")
    print("-" * 60)

    for phone in sorted(matched_phones):
        csv_row = csv_data[phone]
        contact = phone_to_contact[phone]
        contact_id = contact["id"]

        # Check if contact already has a real name
        existing_first = (contact.get("firstName") or "").strip()
        if existing_first and not existing_first.lower().startswith("vapi") and existing_first != "+":
            skipped_has_name += 1
            continue

        # Build update payload
        payload = {}
        owner = csv_row.get("owner_name", "")
        if owner:
            first, last = split_name(owner)
            if first:
                payload["firstName"] = first
            if last:
                payload["lastName"] = last

        company = csv_row.get("company", "")
        if company:
            payload["companyName"] = company

        niche = normalize_niche(csv_row.get("niche", ""))
        if niche:
            payload["customFields"] = [
                {"id": NICHE_FIELD_ID, "value": niche}
            ]

        if not payload:
            skipped_no_match += 1
            continue

        # Update contact
        try:
            resp = update_contact(contact_id, payload)
            if resp.status_code in (200, 201):
                name_str = f"{payload.get('firstName', '')} {payload.get('lastName', '')}".strip()
                company_str = payload.get("companyName", "")
                print(f"  UPDATED {contact_id}: {name_str} | {company_str} | {niche or 'no niche'}")
                updated += 1
            else:
                print(f"  ERROR {contact_id}: {resp.status_code} {resp.text[:100]}")
                errored += 1
        except Exception as e:
            print(f"  ERROR {contact_id}: {e}")
            errored += 1

        # Add niche tag
        if niche:
            tag = f"niche:{niche.lower().replace(' ', '-')}"
            try:
                tag_resp = add_tag(contact_id, tag)
                if tag_resp.status_code in (200, 201):
                    niche_tagged += 1
            except:
                pass

        time.sleep(0.3)  # rate limiting

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Updated:          {updated}")
    print(f"  Skipped (has name): {skipped_has_name}")
    print(f"  No match in GHL:  {len(csv_phones) - len(matched_phones)}")
    print(f"  Niche tags added: {niche_tagged}")
    print(f"  Errors:           {errored}")
    print("=" * 60)


if __name__ == "__main__":
    main()
