#!/usr/bin/env python3
"""
ClawOps Batch Caller - Fires outbound calls via VAPI API
Timezone-aware scheduling, auto-staggering, DNC filtering

Usage:
  python3 batch-caller.py --batch monday-batch-2026-03-17.csv [--dry-run] [--limit 5]
  python3 batch-caller.py --batch monday-batch-2026-03-17.csv --tz ET  # only ET timezone leads
"""

import csv
import json
import os
import sys
import time
import urllib.request
from datetime import datetime

VAPI_API_KEY = os.environ.get("VAPI_API_KEY", "d9ca90ef-0dc2-464a-9c06-ca0163d8d805")
ASSISTANT_ID = "a036984d-72d5-4609-b392-6a635d49f6dd"
PHONE_NUMBER_ID = "69ded64e-24e3-450c-bd7e-b2172fe72f7b"  # Vonage outbound

# DNC list
DNC = {"+18327290017"}  # Heights AC

def fire_call(phone, customer_name=""):
    """Fire a single outbound call via VAPI"""
    url = "https://api.vapi.ai/call/phone"
    headers = {
        "User-Agent": "ClawOps/1.0",
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "assistantId": ASSISTANT_ID,
        "phoneNumberId": PHONE_NUMBER_ID,
        "customer": {
            "number": phone,
            "name": customer_name
        }
    }
    
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        return {"success": True, "id": result.get("id"), "status": result.get("status")}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        return {"success": False, "error": f"HTTP {e.code}: {error_body}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    import argparse
    parser = argparse.ArgumentParser(description="ClawOps Batch Caller")
    parser.add_argument("--batch", required=True, help="CSV file with batch leads")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be called without calling")
    parser.add_argument("--limit", type=int, default=0, help="Max calls to fire (0 = all)")
    parser.add_argument("--tz", type=str, default="", help="Filter by timezone (ET, CT, MT, MST)")
    parser.add_argument("--delay", type=float, default=5.0, help="Seconds between calls")
    parser.add_argument("--skip-callbacks", action="store_true", help="Skip callback leads")
    args = parser.parse_args()
    
    # Load batch
    leads = []
    with open(args.batch) as f:
        reader = csv.DictReader(f)
        for row in reader:
            leads.append(row)
    
    print(f"Loaded {len(leads)} leads from {args.batch}")
    
    # Filter
    if args.tz:
        leads = [l for l in leads if l.get('TZ', '').upper() == args.tz.upper()]
        print(f"Filtered to {len(leads)} leads in timezone {args.tz}")
    
    if args.skip_callbacks:
        leads = [l for l in leads if 'CALLBACK' not in l.get('Business Name', '').upper()]
        print(f"After skipping callbacks: {len(leads)}")
    
    if args.limit > 0:
        leads = leads[:args.limit]
        print(f"Limited to {len(leads)} calls")
    
    # Filter DNC
    before = len(leads)
    leads = [l for l in leads if l.get('Phone', '') not in DNC]
    if len(leads) < before:
        print(f"Removed {before - len(leads)} DNC numbers")
    
    if not leads:
        print("No leads to call!")
        return
    
    print(f"\n{'#':>3} {'Business':35s} {'Phone':16s} {'TZ':3s} {'Score':>5} {'Status':10s}")
    print("-" * 80)
    
    results = {"success": 0, "failed": 0, "skipped": 0}
    call_ids = []
    
    for i, lead in enumerate(leads, 1):
        name = lead.get('Business Name', 'Unknown')[:35]
        phone = lead.get('Phone', '')
        tz = lead.get('TZ', '??')
        score = lead.get('Score', '?')
        
        if args.dry_run:
            print(f"{i:3d} {name:35s} {phone:16s} {tz:3s} {score:>5} [DRY RUN]")
            continue
        
        result = fire_call(phone, name)
        
        if result["success"]:
            results["success"] += 1
            call_ids.append(result["id"])
            print(f"{i:3d} {name:35s} {phone:16s} {tz:3s} {score:>5} FIRED ({result['id'][:12]}...)")
        else:
            results["failed"] += 1
            error_short = result["error"][:50]
            print(f"{i:3d} {name:35s} {phone:16s} {tz:3s} {score:>5} FAILED: {error_short}")
            
            # Check for wallet empty
            if "Wallet" in result["error"] or "balance" in result["error"].lower():
                print(f"\n!!! WALLET EMPTY - stopping batch !!!")
                break
        
        if i < len(leads):
            time.sleep(args.delay)
    
    print(f"\n=== BATCH COMPLETE ===")
    print(f"Success: {results['success']}")
    print(f"Failed: {results['failed']}")
    print(f"Estimated cost: ${results['success'] * 0.15:.2f}")
    
    if call_ids:
        # Save call IDs for post-call analysis
        timestamp = datetime.now().strftime("%Y%m%d-%H%M")
        ids_file = f"batch-call-ids-{timestamp}.json"
        with open(ids_file, 'w') as f:
            json.dump({"timestamp": timestamp, "batch": args.batch, "call_ids": call_ids}, f, indent=2)
        print(f"Call IDs saved to {ids_file}")
        print(f"\nRun post-call analysis in 15 min:")
        print(f"  python3 post-call-analyzer.py --latest --limit {results['success']} --summary")

if __name__ == "__main__":
    main()
