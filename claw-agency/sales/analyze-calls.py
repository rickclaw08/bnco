#!/usr/bin/env python3
import json
import urllib.request

VAPI_API_KEY = "25eb4fb7-27c5-4ada-bd3a-1a8bfacbac7a"

def get_call_status(call_id):
    url = f"https://api.vapi.ai/call/{call_id}"
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except Exception as e:
        return {"error": str(e)}

# Load call IDs
with open("batch-2-second-half-call-ids.txt") as f:
    call_ids = [line.strip() for line in f]

print("Batch 2 Second Half Analysis (8:30 AM calls)")
print("=" * 60)

statuses = {}
costs = []
durations = []

for i, call_id in enumerate(call_ids, 1):
    call_data = get_call_status(call_id)
    
    if "error" in call_data:
        print(f"{i:2d}. {call_id[:8]}... ERROR: {call_data['error']}")
        continue
        
    status = call_data.get("status", "unknown")
    cost = call_data.get("cost", 0)
    duration = call_data.get("duration", 0)
    customer_name = call_data.get("customer", {}).get("name", "Unknown")[:25]
    
    statuses[status] = statuses.get(status, 0) + 1
    if cost > 0:
        costs.append(cost)
    if duration:
        durations.append(duration)
    
    print(f"{i:2d}. {customer_name:25s} {status:12s} Cost: ${cost:.3f} Duration: {duration}s")

print(f"\n📊 SUMMARY:")
for status, count in statuses.items():
    print(f"{status}: {count} calls")

if costs:
    total_cost = sum(costs)
    avg_cost = total_cost / len(costs)
    print(f"\n💰 COSTS:")
    print(f"Total: ${total_cost:.2f}")
    print(f"Average: ${avg_cost:.3f} per completed call")

if durations:
    avg_duration = sum(durations) / len(durations)
    print(f"\n⏱️ DURATIONS:")
    print(f"Average: {avg_duration:.1f} seconds per call")

print(f"\nTotal calls analyzed: {len(call_ids)}")