#!/usr/bin/env python3
"""
Import missing pain-signal leads into GHL as new contacts, then tag them.
Only imports leads NOT already in GHL (by phone number).
"""

import csv
import os
import time
import requests

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

NICHE_FIELD_ID = "F7txi11mIuhx3qbh1tKB"
NICHE_MAP = {
    "hvac": "HVAC",
    "plumbing": "Plumbing",
    "electrical": "Electrical",
    "roofing": "Roofing",
    "general contractor": "General Contractor",
    "landscaping": "Landscaping",
}

# Phones already in GHL (from Fix C run)
ALREADY_IN_GHL = {
    "+15202100543",  # Curtis Plumbing
    "+16142351899",  # Quality Electric
    "+16146881054",  # Buckeye Electric
    "+16144363007",  # R & T Yoder
}


def normalize_phone(phone):
    if not phone:
        return None
    digits = "".join(c for c in str(phone) if c.isdigit())
    if len(digits) == 10:
        digits = "1" + digits
    if len(digits) == 11 and digits.startswith("1"):
        return "+" + digits
    return None


def main():
    print("=" * 60)
    print("Import Missing Pain-Signal Leads to GHL")
    print("=" * 60)

    # Load CSV
    leads = []
    with open(CSV_PATH, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            phone = normalize_phone(row.get("Phone", ""))
            if phone and phone not in ALREADY_IN_GHL:
                leads.append({
                    "phone": phone,
                    "business": row.get("Business Name", "").strip(),
                    "city": row.get("City", "").strip(),
                    "state": row.get("State", "").strip(),
                    "niche": row.get("Niche", "").strip(),
                    "pain_score": row.get("Pain Score", ""),
                    "pain_evidence": row.get("Pain Evidence", ""),
                    "website": row.get("Website", "").strip(),
                    "address": row.get("Address", "").strip(),
                })

    print(f"\nLeads to import: {len(leads)}")

    created = 0
    errored = 0

    for lead in leads:
        niche = NICHE_MAP.get(lead["niche"].lower(), lead["niche"])

        payload = {
            "locationId": LOCATION_ID,
            "phone": lead["phone"],
            "companyName": lead["business"],
            "city": lead["city"],
            "state": lead["state"],
            "website": lead["website"],
            "address1": lead["address"],
            "tags": [TAG_NAME, f"niche:{niche.lower().replace(' ', '-')}"],
            "source": "pain-signal-scrape",
            "customFields": [
                {"id": NICHE_FIELD_ID, "value": niche}
            ],
        }

        # Use business name as contact name if no owner
        if lead["business"]:
            payload["firstName"] = lead["business"]

        try:
            resp = requests.post(f"{BASE_URL}/contacts/", headers=HEADERS, json=payload)
            if resp.status_code == 429:
                retry = int(resp.headers.get("Retry-After", 5))
                print(f"  Rate limited, waiting {retry}s...")
                time.sleep(retry)
                resp = requests.post(f"{BASE_URL}/contacts/", headers=HEADERS, json=payload)

            if resp.status_code in (200, 201):
                data = resp.json()
                contact_id = data.get("contact", {}).get("id", "unknown")
                print(f"  CREATED {contact_id}: {lead['business']} ({lead['city']}, {niche}) pain={lead['pain_score']}")
                created += 1
            else:
                print(f"  ERROR: {resp.status_code} {resp.text[:150]}")
                errored += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            errored += 1

        time.sleep(0.4)

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Created:  {created}")
    print(f"  Errors:   {errored}")
    print(f"  Skipped (already in GHL): {len(ALREADY_IN_GHL)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
