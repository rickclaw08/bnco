#!/usr/bin/env python3
"""
Velocity VAPI Scheduled Caller - Fires at 10:30 AM EST
Calls Herbert Craig and Judith Johnson
HARD LOCK: Only runs between 9 AM - 6 PM EST

After calls complete, waits 5 min then pulls transcripts and reports.
"""

import os
import json
import time
import requests
from datetime import datetime

VAPI_API_KEY = os.environ.get("VAPI_API_KEY", "d9ca90ef-0dc2-464a-9c06-ca0163d8d805")
AGENT_ID = "094c420d-e27f-484e-895a-399d2dfb5592"
PHONE_NUMBER_ID = "d462440c-9949-4df7-9b52-ebeb8e9e8955"  # +15139953474 (513)

MEMORY_DIR = "/Users/agentclaw/.openclaw/workspace/velocity_root/memory"

def get_et_hour():
    """Get current hour in ET (simple UTC-4 for EDT)."""
    import calendar
    utc_now = datetime.utcnow()
    et_hour = (utc_now.hour - 4) % 24
    return et_hour

def check_outbound_window():
    """HARD LOCK: No outbound outside 9 AM - 6 PM EST."""
    hour = get_et_hour()
    if hour < 9 or hour >= 18:
        print(f"BLOCKED: ET hour is {hour}. Outbound window is 9-18 ET.")
        return False
    print(f"Outbound window OK: ET hour is {hour}")
    return True

LEADS = [
    {
        "name": "Herbert Craig",
        "phone": "+15135226444",
        "ownerName": "Herbert",
        "propertyAddress": "7264 Swirlwood Ln",
        "auctionDate": "April 8th",
        "lenderName": "TruPartner Credit Union",
        "ghl_contact_id": "Fs1MRrQNirytztCTiCIy"
    },
    {
        "name": "Judith Johnson",
        "phone": "+15132992669",
        "ownerName": "Judith",
        "propertyAddress": "5453 Starcrest Dr",
        "auctionDate": "April 8th",
        "lenderName": "Rocket Mortgage",
        "ghl_contact_id": "dhnCMQlK0w8MbtoztTEa"
    }
]

def make_call(lead):
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
        "https://api.vapi.ai/call",
        headers={
            "Authorization": f"Bearer {VAPI_API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload
    )
    
    if resp.status_code in (200, 201):
        data = resp.json()
        return {"success": True, "call_id": data.get("id"), "status": data.get("status")}
    else:
        return {"success": False, "error": resp.text[:300]}

def get_call_details(call_id):
    resp = requests.get(
        f"https://api.vapi.ai/call/{call_id}",
        headers={"Authorization": f"Bearer {VAPI_API_KEY}"}
    )
    if resp.status_code == 200:
        return resp.json()
    return None

def classify_disposition(call_data):
    """Classify call into HOT/WARM/VOICEMAIL/DNC/NO_ANSWER."""
    ended = call_data.get("endedReason", "")
    transcript = call_data.get("artifact", {}).get("transcript", "") or ""
    duration_est = len(transcript.split()) / 3  # rough seconds estimate
    
    # DNC signals
    dnc_phrases = ["don't call", "not interested", "stop calling", "leave me alone", "do not call"]
    for phrase in dnc_phrases:
        if phrase.lower() in transcript.lower():
            return "DNC"
    
    # Voicemail
    if "voicemail" in ended.lower() or "machine" in ended.lower():
        return "VOICEMAIL"
    
    # No answer
    if ended in ["no-answer", "busy", "failed"]:
        return "NO_ANSWER"
    
    # Interested signals
    interested_phrases = ["tell me more", "how does this work", "what would you offer",
                         "i'm listening", "go ahead", "okay", "how much", "call me back",
                         "what time", "sounds interesting"]
    for phrase in interested_phrases:
        if phrase.lower() in transcript.lower():
            return "HOT_LEAD"
    
    # Hung up quickly (< ~30 words in transcript = short call)
    if len(transcript.split()) < 30 and ended == "customer-ended-call":
        return "COLD"
    
    # Talked but noncommittal
    if len(transcript.split()) > 30:
        return "WARM"
    
    return "COLD"

if __name__ == "__main__":
    if not check_outbound_window():
        exit(1)
    
    print(f"=== Velocity Morning Calls - {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} ===\n")
    
    call_results = []
    
    for lead in LEADS:
        print(f"--- Calling {lead['name']} ({lead['phone']}) ---")
        result = make_call(lead)
        if result["success"]:
            print(f"  QUEUED - Call ID: {result['call_id']}")
            call_results.append({
                "lead": lead["name"],
                "phone": lead["phone"],
                "call_id": result["call_id"],
                "ghl_contact_id": lead["ghl_contact_id"]
            })
        else:
            print(f"  FAILED - {result['error']}")
            call_results.append({
                "lead": lead["name"],
                "phone": lead["phone"],
                "call_id": None,
                "error": result["error"]
            })
        time.sleep(5)  # stagger calls
    
    # Wait for calls to complete
    print("\nWaiting 5 minutes for calls to complete...")
    time.sleep(300)
    
    # Pull results
    print("\n=== CALL RESULTS ===\n")
    report_lines = []
    
    for cr in call_results:
        if not cr.get("call_id"):
            report_lines.append(f"{cr['lead']}: FAILED TO QUEUE - {cr.get('error','unknown')}")
            continue
        
        details = get_call_details(cr["call_id"])
        if not details:
            report_lines.append(f"{cr['lead']}: Could not retrieve call details")
            continue
        
        status = details.get("status", "?")
        ended = details.get("endedReason", "?")
        cost = details.get("cost", 0)
        transcript = details.get("artifact", {}).get("transcript", "") or ""
        disposition = classify_disposition(details)
        
        line = f"{cr['lead']}: status={status}, ended={ended}, cost=${cost}, disposition={disposition}"
        print(line)
        if transcript:
            print(f"  Transcript: {transcript[:500]}")
        report_lines.append(line)
        report_lines.append(f"  Transcript: {transcript[:500] if transcript else 'None'}")
    
    # Save to memory
    today = datetime.utcnow().strftime("%Y-%m-%d")
    memory_file = os.path.join(MEMORY_DIR, f"{today}.md")
    
    with open(memory_file, "a") as f:
        f.write(f"\n\n### 10:35 AM ET - Morning VAPI Call Results\n\n")
        for line in report_lines:
            f.write(f"{line}\n")
    
    print(f"\nResults saved to {memory_file}")
    
    # Output summary for OpenClaw to relay to Brand
    print("\n=== SUMMARY FOR BRAND ===")
    for cr in call_results:
        if cr.get("call_id"):
            details = get_call_details(cr["call_id"])
            if details:
                disposition = classify_disposition(details)
                print(f"VELOCITY CALL: {cr['lead']} - {disposition}")
                if disposition == "HOT_LEAD":
                    print(f"  *** HOT LEAD ALERT: {cr['lead']} at {cr['phone']} expressed interest! ***")
