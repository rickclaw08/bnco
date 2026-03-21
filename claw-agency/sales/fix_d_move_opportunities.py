#!/usr/bin/env python3
"""
Fix D: Move all opportunities from Unknown stage to New Lead stage.
"""

import os
import time
import requests

GHL_API_KEY = os.environ.get("GHL_API_KEY", "pit-4a664329-2ae4-4b92-a44c-602cc7e2bc85")
LOCATION_ID = "Ez2ADxydpjvWsW3suYiq"
PIPELINE_ID = "MK59XHOAuRJU2IjgzHiq"
NEW_LEAD_STAGE = "1db90119-517e-4c71-a2d7-52321931690f"
BASE_URL = "https://services.leadconnectorhq.com"
HEADERS = {
    "Authorization": f"Bearer {GHL_API_KEY}",
    "Version": "2021-07-28",
    "Content-Type": "application/json",
    "Accept": "application/json",
}


def fetch_all_opportunities():
    """Fetch all opportunities using cursor-based pagination."""
    opportunities = []
    url = f"{BASE_URL}/opportunities/search"
    payload = {
        "locationId": LOCATION_ID,
        "pipelineId": PIPELINE_ID,
        "limit": 100,
        "page": 1,
    }
    while True:
        resp = requests.post(url, headers=HEADERS, json=payload)
        if resp.status_code == 429:
            retry = int(resp.headers.get("Retry-After", 5))
            print(f"  Rate limited, waiting {retry}s...")
            time.sleep(retry)
            continue
        if resp.status_code != 200:
            # Try GET endpoint instead
            break
        data = resp.json()
        batch = data.get("opportunities", [])
        if not batch:
            break
        opportunities.extend(batch)
        meta = data.get("meta", {})
        print(f"  Fetched {len(opportunities)} opportunities (page {payload['page']})...")
        if len(batch) < 100:
            break
        payload["page"] += 1
        time.sleep(0.3)
    return opportunities


def fetch_opps_get():
    """Fallback: fetch opportunities via GET endpoint."""
    opportunities = []
    page = 1
    while True:
        url = f"{BASE_URL}/opportunities/search?location_id={LOCATION_ID}&pipeline_id={PIPELINE_ID}&limit=100&page={page}"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 429:
            retry = int(resp.headers.get("Retry-After", 5))
            time.sleep(retry)
            continue
        if resp.status_code != 200:
            print(f"  GET failed: {resp.status_code} {resp.text[:200]}")
            break
        data = resp.json()
        batch = data.get("opportunities", [])
        if not batch:
            break
        opportunities.extend(batch)
        print(f"  Fetched {len(opportunities)} opportunities (page {page})...")
        if len(batch) < 100:
            break
        page += 1
        time.sleep(0.3)
    return opportunities


def main():
    print("=" * 60)
    print("Fix D: Move Opportunities to New Lead Stage")
    print("=" * 60)

    print("\nFetching opportunities...")
    opps = fetch_all_opportunities()
    if not opps:
        print("POST search failed, trying GET...")
        opps = fetch_opps_get()

    print(f"\nTotal opportunities: {len(opps)}")

    # Filter to only those NOT already in New Lead stage
    to_move = [o for o in opps if o.get("pipelineStageId") != NEW_LEAD_STAGE]
    already_there = len(opps) - len(to_move)

    print(f"  Already in New Lead: {already_there}")
    print(f"  To move: {len(to_move)}")

    moved = 0
    errored = 0

    for opp in to_move:
        opp_id = opp["id"]
        try:
            resp = requests.put(
                f"{BASE_URL}/opportunities/{opp_id}",
                headers=HEADERS,
                json={
                    "pipelineStageId": NEW_LEAD_STAGE,
                    "pipelineId": PIPELINE_ID,
                }
            )
            if resp.status_code == 429:
                retry = int(resp.headers.get("Retry-After", 5))
                time.sleep(retry)
                resp = requests.put(
                    f"{BASE_URL}/opportunities/{opp_id}",
                    headers=HEADERS,
                    json={
                        "pipelineStageId": NEW_LEAD_STAGE,
                        "pipelineId": PIPELINE_ID,
                    }
                )
            if resp.status_code in (200, 201):
                moved += 1
                if moved % 50 == 0:
                    print(f"  Moved {moved}...")
            else:
                print(f"  ERROR {opp_id}: {resp.status_code} {resp.text[:100]}")
                errored += 1
        except Exception as e:
            print(f"  ERROR {opp_id}: {e}")
            errored += 1

        time.sleep(0.2)

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Moved to New Lead: {moved}")
    print(f"  Already there:     {already_there}")
    print(f"  Errors:            {errored}")
    print("=" * 60)


if __name__ == "__main__":
    main()
