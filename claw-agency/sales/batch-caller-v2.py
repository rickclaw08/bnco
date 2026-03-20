#!/usr/bin/env python3
"""
ClawOps Batch Caller v2 - 3-Touch Sequence Aware
Uses enriched lead data with owner names.
Tracks touch sequence progress.

Usage:
  python3 batch-caller-v2.py --csv mega-lead-scrape-enriched.csv --touch 1 --limit 50 [--dry-run]
  python3 batch-caller-v2.py --csv mega-lead-scrape-enriched.csv --touch 3 --limit 50 --time afternoon
"""

import csv
import json
import os
import sys
import time
import urllib.request
from datetime import datetime

VAPI_API_KEY = os.environ.get("VAPI_API_KEY", "")
ASSISTANT_ID = "a036984d-72d5-4609-b392-6a635d49f6dd"
PHONE_NUMBER_ID = "69ded64e-24e3-450c-bd7e-b2172fe72f7b"  # Vonage outbound

# Internal DNC list (add numbers of anyone who said "stop calling" or "remove me")
DNC_FILE = os.path.join(os.path.dirname(__file__), "dnc-list.txt")

def load_dnc():
    dnc = set()
    if os.path.exists(DNC_FILE):
        with open(DNC_FILE) as f:
            for line in f:
                num = line.strip()
                if num:
                    dnc.add(num)
    return dnc

def fire_call(phone, customer_name="", owner_name=""):
    """Fire a single outbound call via VAPI with owner name context."""
    url = "https://api.vapi.ai/call/phone"
    headers = {
        "User-Agent": "ClawOps/1.0",
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Pass owner name as assistant override so Jordan knows who to ask for
    payload = {
        "assistantId": ASSISTANT_ID,
        "phoneNumberId": PHONE_NUMBER_ID,
        "customer": {
            "number": phone,
            "name": customer_name
        }
    }
    
    # If we have an owner name, inject it into the assistant's context
    if owner_name:
        payload["assistantOverrides"] = {
            "variableValues": {
                "ownerName": owner_name,
                "companyName": customer_name
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
    parser = argparse.ArgumentParser(description="ClawOps Batch Caller v2 - 3-Touch Sequence")
    parser.add_argument("--csv", required=True, help="Enriched CSV file")
    parser.add_argument("--touch", type=int, default=1, choices=[1, 2, 3], help="Which touch in the sequence (1, 2, or 3)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=50, help="Max calls per batch (default 50)")
    parser.add_argument("--delay", type=float, default=5.0, help="Seconds between calls")
    parser.add_argument("--niche", type=str, default="", help="Filter by niche (HVAC, Plumbing, etc)")
    parser.add_argument("--state", type=str, default="", help="Filter by state (TX, OH, etc)")
    parser.add_argument("--owner-only", action="store_true", help="Only call leads with known owner names")
    parser.add_argument("--no-owner-only", action="store_true", help="Only call leads WITHOUT owner names")
    args = parser.parse_args()
    
    # Load DNC
    dnc = load_dnc()
    print(f"DNC list: {len(dnc)} numbers")
    
    # Load leads
    leads = []
    with open(args.csv) as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            leads.append(row)
    
    print(f"Loaded {len(leads)} leads from {args.csv}")
    
    # Check for touch tracking columns, add if missing
    touch_cols = [f'Touch{args.touch}_Date', f'Touch{args.touch}_Result', f'Touch{args.touch}_CallID']
    
    # Filter: DNC
    before = len(leads)
    leads = [l for l in leads if l.get('Phone', '') not in dnc]
    if len(leads) < before:
        print(f"Removed {before - len(leads)} DNC numbers")
    
    # Filter: niche
    if args.niche:
        leads = [l for l in leads if args.niche.lower() in l.get('Niche', '').lower()]
        print(f"Filtered to {len(leads)} {args.niche} leads")
    
    # Filter: state
    if args.state:
        leads = [l for l in leads if l.get('State', '').upper() == args.state.upper()]
        print(f"Filtered to {len(leads)} leads in {args.state}")
    
    # Filter: owner name
    if args.owner_only:
        leads = [l for l in leads if l.get('Owner_Name', '').strip()]
        print(f"Filtered to {len(leads)} leads with owner names")
    elif args.no_owner_only:
        leads = [l for l in leads if not l.get('Owner_Name', '').strip()]
        print(f"Filtered to {len(leads)} leads without owner names")
    
    # Filter: touch sequence (only call leads that haven't had this touch yet)
    touch_date_col = f'Touch{args.touch}_Date'
    if touch_date_col in (leads[0] if leads else {}):
        leads = [l for l in leads if not l.get(touch_date_col, '').strip()]
        print(f"Filtered to {len(leads)} leads needing Touch {args.touch}")
    
    # For Touch 2/3, only include leads that completed previous touch
    if args.touch == 2:
        prev_col = 'Touch1_Date'
        if prev_col in (leads[0] if leads else {}):
            leads = [l for l in leads if l.get(prev_col, '').strip()]
            print(f"Filtered to {len(leads)} leads that completed Touch 1")
    elif args.touch == 3:
        prev_col = 'Touch2_Date'
        if prev_col in (leads[0] if leads else {}):
            leads = [l for l in leads if l.get(prev_col, '').strip()]
            print(f"Filtered to {len(leads)} leads that completed Touch 2")
    
    # Limit
    if args.limit > 0:
        leads = leads[:args.limit]
    
    if not leads:
        print("No leads to call!")
        return
    
    print(f"\nFiring Touch {args.touch} for {len(leads)} leads {'[DRY RUN]' if args.dry_run else ''}")
    print(f"{'#':>3} {'Business':30s} {'Owner':20s} {'Phone':16s} {'State':5s} {'Status':10s}")
    print("-" * 90)
    
    results = {"success": 0, "failed": 0}
    call_ids = []
    
    for i, lead in enumerate(leads, 1):
        name = lead.get('Business Name', 'Unknown')[:30]
        owner = lead.get('Owner_Name', '')[:20] or '-'
        phone = lead.get('Phone', '')
        state = lead.get('State', '??')
        
        if args.dry_run:
            print(f"{i:3d} {name:30s} {owner:20s} {phone:16s} {state:5s} [DRY RUN]")
            continue
        
        result = fire_call(phone, name, lead.get('Owner_Name', ''))
        
        if result["success"]:
            results["success"] += 1
            call_ids.append({"id": result["id"], "phone": phone, "company": name, "owner": owner})
            print(f"{i:3d} {name:30s} {owner:20s} {phone:16s} {state:5s} FIRED")
        else:
            results["failed"] += 1
            error_short = result["error"][:40]
            print(f"{i:3d} {name:30s} {owner:20s} {phone:16s} {state:5s} FAIL: {error_short}")
            
            if "Wallet" in result.get("error", "") or "balance" in result.get("error", "").lower():
                print(f"\n!!! WALLET EMPTY - stopping !!!")
                break
        
        if i < len(leads):
            time.sleep(args.delay)
    
    print(f"\n=== TOUCH {args.touch} COMPLETE ===")
    print(f"Success: {results['success']}, Failed: {results['failed']}")
    print(f"Est. cost: ${results['success'] * 0.15:.2f}")
    
    if call_ids:
        timestamp = datetime.now().strftime("%Y%m%d-%H%M")
        ids_file = os.path.join(os.path.dirname(args.csv), f"touch{args.touch}-call-ids-{timestamp}.json")
        with open(ids_file, 'w') as f:
            json.dump({
                "timestamp": timestamp,
                "touch": args.touch,
                "csv": args.csv,
                "call_ids": call_ids
            }, f, indent=2)
        print(f"Call IDs saved to {ids_file}")

if __name__ == "__main__":
    main()
