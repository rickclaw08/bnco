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

# Load call IDs from today only
call_ids = []

# Batch 2 second half (fired at 8:40 AM today)
try:
    with open('batch-2-second-half-call-ids.txt') as f:
        call_ids.extend([line.strip() for line in f])
        print(f"Loaded {len([line.strip() for line in open('batch-2-second-half-call-ids.txt')])} IDs from Batch 2 (8:40 AM)")
except:
    print("No Batch 2 call IDs found")

# Batch 3 (fired at 10:19 AM today)  
try:
    with open('batch-3-call-ids.txt') as f:
        batch3_ids = [line.strip() for line in f]
        call_ids.extend(batch3_ids)
        print(f"Loaded {len(batch3_ids)} IDs from Batch 3 (10:19 AM)")
except:
    print("No Batch 3 call IDs found")

print(f'\n🔍 EXAMINING FULL TRANSCRIPTS FROM {len(call_ids)} CALLS TODAY')
print('=' * 80)

# Check the top "positive" calls I flagged
positive_call_names = [
    "A.B. May Heating, A/C, Pl",
    "John Moore Services", 
    "Baker Brothers Plumbing",
    "Choice Plumbing Orlando",
    "Goettl Air Conditioning"
]

real_leads = []

for i, call_id in enumerate(call_ids, 1):
    call_data = get_call_details(call_id)
    
    if 'error' in call_data:
        continue
        
    customer_name = call_data.get('customer', {}).get('name', 'Unknown')
    created_at = call_data.get('createdAt', '')
    transcript = call_data.get('transcript', '')
    
    # Only show calls that had "positive" keywords and full transcripts
    if any(name in customer_name for name in positive_call_names) and transcript:
        print(f'\n📞 {customer_name} (Call ID: {call_id[:8]}...)')
        print(f'   Created: {created_at}')
        print(f'   FULL TRANSCRIPT:')
        print('   ' + '='*60)
        print(f'   {transcript}')
        print('   ' + '='*60)
        
        # Analyze if this is actually a lead for ClawOps
        transcript_lower = transcript.lower()
        if 'ai' in transcript_lower and ('receptionist' in transcript_lower or 'system' in transcript_lower):
            real_leads.append(customer_name)
            print('   ✅ ACTUAL LEAD: Discussed AI/receptionist services')
        else:
            print('   ❌ FALSE POSITIVE: Just standard business phone menu/hold music')
        
        print()

print(f'🎯 REAL SALES ANALYSIS:')
print(f'Calls examined: {len(call_ids)}')
print(f'Actual ClawOps leads: {len(real_leads)}')
if real_leads:
    for lead in real_leads:
        print(f'  • {lead}')
else:
    print('❌ NO ACTUAL SALES - All "positive" signals were automated phone systems')