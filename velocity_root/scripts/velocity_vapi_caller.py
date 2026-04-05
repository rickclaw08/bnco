#!/usr/bin/env python3
"""Queue VAPI outbound calls to landline leads for Project Velocity."""

import os
import json
import time
import requests

VAPI_API_KEY = os.environ.get("VAPI_API_KEY", "d9ca90ef-0dc2-464a-9c06-ca0163d8d805")
BASE_URL = "https://api.vapi.ai"

# Load the velocity agent ID
with open("/Users/agentclaw/.openclaw/workspace/velocity_root/config/vapi_velocity_agent.json") as f:
    agent_config = json.load(f)

AGENT_ID = agent_config["agent_id"]

# 513 outbound number (ClawOps Outbound - VAPI native)
PHONE_NUMBER_ID = "d462440c-9949-4df7-9b52-ebeb8e9e8955"  # +15139953474

# Landline leads
LEADS = [
    {
        "name": "Herbert Craig",
        "phone": "+15135226444",
        "ownerName": "Herbert or Marilyn Craig",
        "propertyAddress": "7264 Swirlwood Ln, Cincinnati OH",
        "auctionDate": "April 8, 2026",
        "lenderName": "TruPartner Credit Union",
        "notes": "Elderly (88), homestead. Case in Marilyn's name. Be extra patient."
    },
    {
        "name": "Judith Johnson",
        "phone": "+15132992669",
        "ownerName": "Judith Johnson",
        "propertyAddress": "5453 Starcrest Dr, Cincinnati OH",
        "auctionDate": "April 8, 2026",
        "lenderName": "Rocket Mortgage",
        "notes": "Marginal equity. Landline only. Standard approach."
    }
]

results = []

for lead in LEADS:
    print(f"\n--- Calling {lead['name']} at {lead['phone']} ---")
    
    payload = {
        "assistantId": AGENT_ID,
        "phoneNumberId": PHONE_NUMBER_ID,
        "customer": {
            "number": lead["phone"],
            "name": lead["name"]
        },
        "assistantOverrides": {
            "variableValues": {
                "ownerName": lead["ownerName"],
                "propertyAddress": lead["propertyAddress"],
                "auctionDate": lead["auctionDate"],
                "lenderName": lead["lenderName"]
            }
        }
    }
    
    resp = requests.post(
        f"{BASE_URL}/call",
        headers={
            "Authorization": f"Bearer {VAPI_API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload
    )
    
    if resp.status_code in (200, 201):
        data = resp.json()
        call_id = data.get("id", "UNKNOWN")
        status = data.get("status", "UNKNOWN")
        print(f"  QUEUED - Call ID: {call_id}")
        print(f"  Status: {status}")
        results.append({
            "lead": lead["name"],
            "phone": lead["phone"],
            "call_id": call_id,
            "status": status,
            "success": True
        })
    else:
        print(f"  FAILED - Status: {resp.status_code}")
        error_text = resp.text[:300]
        print(f"  Error: {error_text}")
        results.append({
            "lead": lead["name"],
            "phone": lead["phone"],
            "call_id": None,
            "status": "FAILED",
            "error": error_text,
            "success": False
        })
    
    # Rate limit buffer
    time.sleep(3)

print("\n=== CALL QUEUE RESULTS ===")
for r in results:
    status = "QUEUED" if r["success"] else "FAILED"
    print(f"  {r['lead']}: {status} - Call ID: {r.get('call_id', 'N/A')}")

# Save results
with open("/Users/agentclaw/.openclaw/workspace/velocity_root/outreach/vapi_call_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("\nResults saved to outreach/vapi_call_results.json")
