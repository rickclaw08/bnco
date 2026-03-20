#!/usr/bin/env python3
import csv
import json
import urllib.request
import time
from datetime import datetime

# WORKING API KEY + Cloudflare bypass
VAPI_API_KEY = '25eb4fb7-27c5-4ada-bd3a-1a8bfacbac7a'
ASSISTANT_ID = 'a036984d-72d5-4609-b392-6a635d49f6dd'
PHONE_NUMBER_ID = '69ded64e-24e3-450c-bd7e-b2172fe72f7b'

def fire_call(phone, name):
    url = 'https://api.vapi.ai/call/phone'
    headers = {
        'Authorization': f'Bearer {VAPI_API_KEY}',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
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

# Load Batch 4 (CT afternoon, scheduled for 11:30 AM ET)
with open('wednesday-batches/batch-04-CT-afternoon.csv') as f:
    reader = csv.DictReader(f)
    leads = list(reader)

print(f'🚀 BATCH 4 - CT AFTERNOON ({len(leads)} calls)')
print(f'⏰ Scheduled: 11:30 AM ET (33 min late)')
print('=' * 70)

success = 0
call_ids = []
start_time = datetime.now()

for i, lead in enumerate(leads, 1):
    name = lead.get('Business Name', 'Unknown')[:30]
    phone = lead.get('Phone', '')
    tz = lead.get('TZ', '??')
    
    result, data = fire_call(phone, name)
    
    if result:
        success += 1
        call_ids.append(data)
        print(f'{i:2d}. {name:30s} {phone:15s} {tz:2s} ✅ FIRED (ID: {data[:8]}...)')
    else:
        print(f'{i:2d}. {name:30s} {phone:15s} {tz:2s} ❌ FAILED: {data[:50]}')
        
        # Stop if wallet empty or rate limited
        if any(word in data.lower() for word in ['wallet', 'balance', 'credit', 'limit']):
            print('💳 WALLET/LIMIT ISSUE - stopping batch')
            break
    
    # 4 second delay between calls
    time.sleep(4)

end_time = datetime.now()
duration = (end_time - start_time).total_seconds() / 60

print(f'\n🎯 BATCH 4 COMPLETE:')
print(f'✅ Success: {success}/{len(leads)} calls fired')
print(f'💰 Estimated cost: ${success * 0.10:.2f}')
print(f'⏱️  Duration: {duration:.1f} minutes')
print(f'🕐 Completed: {end_time.strftime("%I:%M %p ET")}')

# Save call IDs for tracking
if call_ids:
    with open('batch-4-call-ids.txt', 'w') as f:
        for call_id in call_ids:
            f.write(f'{call_id}\n')
    print(f'📋 Call IDs saved to batch-4-call-ids.txt')

print(f'\n📊 RUNNING TOTALS TODAY:')
print(f'Batches fired: 3 (Batch 2 second half + Batch 3 + Batch 4)')
print(f'Total calls: {55 + success}')
print(f'Total cost: ~${5.45 + success * 0.10:.2f}')