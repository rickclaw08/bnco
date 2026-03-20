#!/usr/bin/env python3
import json
import urllib.request
import time

VAPI_API_KEY = '25eb4fb7-27c5-4ada-bd3a-1a8bfacbac7a'

def get_call_details(call_id):
    url = f'https://api.vapi.ai/call/{call_id}'
    headers = {
        'Authorization': f'Bearer {VAPI_API_KEY}',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except Exception as e:
        return {'error': str(e)}

# Load Batch 4 call IDs
with open('batch-4-call-ids.txt') as f:
    call_ids = [line.strip() for line in f]

print(f'🔍 ANALYZING BATCH 4 - {len(call_ids)} CALLS')
print('=' * 70)

statuses = {}
costs = []
durations = []
real_leads = []
transcript_samples = []

# Keywords that suggest genuine interest in our services
sales_keywords = [
    'ai receptionist', 'automation', 'system', 'interested', 'tell me more',
    'sounds good', 'demo', 'price', 'cost', 'how much', 'owner callback'
]

for i, call_id in enumerate(call_ids, 1):
    call_data = get_call_details(call_id)
    
    if 'error' in call_data:
        print(f'{i:2d}. ERROR: {call_data["error"][:50]}')
        continue
        
    status = call_data.get('status', 'unknown')
    cost = call_data.get('cost', 0)
    duration = call_data.get('duration', 0)
    customer_name = call_data.get('customer', {}).get('name', 'Unknown')[:25]
    transcript = call_data.get('transcript', '')
    
    statuses[status] = statuses.get(status, 0) + 1
    if cost > 0:
        costs.append(cost)
    if duration:
        durations.append(duration)
    
    # Check for real sales potential
    if transcript:
        transcript_lower = transcript.lower()
        found_keywords = [kw for kw in sales_keywords if kw in transcript_lower]
        
        if found_keywords:
            real_leads.append({
                'name': customer_name,
                'call_id': call_id[:8],
                'cost': cost,
                'keywords': found_keywords,
                'transcript_sample': transcript[:150] + '...'
            })
        
        # Store interesting transcript samples
        if len(transcript) > 100 and any(word in transcript_lower for word in ['owner', 'manager', 'interested']):
            transcript_samples.append({
                'name': customer_name,
                'sample': transcript[:200] + '...'
            })
    
    print(f'{i:2d}. {customer_name:25s} {status:12s} ${cost:.3f} {duration}s')
    
    # Small delay to avoid hammering API
    if i % 10 == 0:
        time.sleep(1)

print(f'\n📊 BATCH 4 SUMMARY:')
for status, count in statuses.items():
    print(f'{status}: {count} calls')

if costs:
    total_cost = sum(costs)
    avg_cost = total_cost / len(costs) if costs else 0
    print(f'\n💰 COSTS:')
    print(f'Total: ${total_cost:.2f}')
    print(f'Average: ${avg_cost:.3f} per call')

if real_leads:
    print(f'\n🎯 POTENTIAL LEADS ({len(real_leads)}):')
    for lead in real_leads:
        print(f'• {lead["name"]} - {lead["keywords"]} (${lead["cost"]:.3f})')
        print(f'  Sample: {lead["transcript_sample"]}')
        print()
else:
    print(f'\n❌ No clear sales leads found in Batch 4')

print(f'\n🔄 CUMULATIVE TODAY:')
print(f'Total batches: 3 completed')
print(f'Total calls fired: ~104 calls')
print(f'Estimated total cost: ~${10.35:.2f}')
print(f'Real leads so far: 2 (from earlier batches) + {len(real_leads)} (Batch 4)')