#!/usr/bin/env python3
import json
import urllib.request

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

# Load all call IDs from today
call_ids = []

# Batch 2 second half
try:
    with open('batch-2-second-half-call-ids.txt') as f:
        call_ids.extend([line.strip() for line in f])
except:
    pass

# Batch 3  
try:
    with open('batch-3-call-ids.txt') as f:
        call_ids.extend([line.strip() for line in f])
except:
    pass

print(f'🔍 ANALYZING {len(call_ids)} CALLS FOR SALES')
print('=' * 60)

sales_indicators = ['interested', 'demo', 'appointment', 'callback', 'yes', 'email', 'sounds good', 'tell me more']
positive_calls = []

for i, call_id in enumerate(call_ids, 1):
    call_data = get_call_details(call_id)
    
    if 'error' in call_data:
        continue
        
    customer_name = call_data.get('customer', {}).get('name', 'Unknown')[:25]
    status = call_data.get('status', 'unknown')
    cost = call_data.get('cost', 0)
    
    # Check transcript for positive indicators
    transcript = call_data.get('transcript', '')
    if transcript:
        transcript_lower = transcript.lower()
        found_indicators = [indicator for indicator in sales_indicators if indicator in transcript_lower]
        
        if found_indicators:
            positive_calls.append({
                'name': customer_name,
                'call_id': call_id[:8],
                'cost': cost,
                'indicators': found_indicators,
                'transcript': transcript[:200] + '...' if len(transcript) > 200 else transcript
            })
            
            print(f'{i:2d}. {customer_name:25s} ✅ POSITIVE - {found_indicators}')
            print(f'    Transcript: {transcript[:100]}...')
            print()
        else:
            print(f'{i:2d}. {customer_name:25s} No positive signals')
    else:
        print(f'{i:2d}. {customer_name:25s} No transcript available')

print(f'\n📊 SALES ANALYSIS:')
print(f'Total calls analyzed: {len(call_ids)}')
print(f'Positive indicators found: {len(positive_calls)}')

if positive_calls:
    print(f'\n🎯 POTENTIAL LEADS:')
    for call in positive_calls:
        print(f'• {call["name"]} (${call["cost"]:.3f}) - {call["indicators"]}')
else:
    print('\n❌ No clear positive signals found in transcripts')