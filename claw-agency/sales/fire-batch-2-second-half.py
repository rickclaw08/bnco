#!/usr/bin/env python3
import csv
import json
import urllib.request
import time

# WORKING API KEY (created 8:43 AM ET)
VAPI_API_KEY = '25eb4fb7-27c5-4ada-bd3a-1a8bfacbac7a'
ASSISTANT_ID = 'a036984d-72d5-4609-b392-6a635d49f6dd'
PHONE_NUMBER_ID = '69ded64e-24e3-450c-bd7e-b2172fe72f7b'

def fire_call(phone, name):
    url = 'https://api.vapi.ai/call/phone'
    headers = {
        'Authorization': f'Bearer {VAPI_API_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'assistantId': ASSISTANT_ID,
        'phoneNumberId': PHONE_NUMBER_ID,
        'customer': {'number': phone, 'name': name}
    }
    
    try:
        req = urllib.request.Request(url, json.dumps(payload).encode(), headers=headers)
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        return True, result.get('id', 'unknown')
    except Exception as e:
        return False, str(e)

# Load second half of batch 2
with open('temp-batch-2-second-half.csv') as f:
    reader = csv.DictReader(f)
    leads = list(reader)

print(f'Batch 2 Second Half - {len(leads)} calls (WORKING API KEY)')
print('=' * 65)

success = 0
call_ids = []

for i, lead in enumerate(leads, 1):
    name = lead.get('Business Name', 'Unknown')[:30]
    phone = lead.get('Phone', '')
    
    result, data = fire_call(phone, name)
    
    if result:
        success += 1
        call_ids.append(data)
        print(f'{i:2d}. {name:30s} {phone:15s} FIRED (ID: {data[:8]}...)')
    else:
        print(f'{i:2d}. {name:30s} {phone:15s} FAILED: {data[:50]}')
    
    # 4 second delay between calls
    time.sleep(4)

print(f'\nBatch 2 Second Half Complete:')
print(f'Success: {success}/{len(leads)} calls fired')
print(f'Estimated cost: ${success * 0.15:.2f}')
print(f'Time: {time.strftime("%I:%M %p ET")}')

# Save call IDs for tracking
with open('batch-2-second-half-call-ids.txt', 'w') as f:
    for call_id in call_ids:
        f.write(f'{call_id}\n')
print(f'Call IDs saved to batch-2-second-half-call-ids.txt')