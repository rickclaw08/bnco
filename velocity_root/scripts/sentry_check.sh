#!/bin/bash
# Sentry Mode - Evening Lead Alert Monitor
# Checks for inbound calls/callbacks to VAPI number
# Fires Telegram alert if high-intent detected

VAPI_KEY="d9ca90ef-0dc2-464a-9c06-ca0163d8d805"
PHONE_ID="d462440c-9949-4df7-9b52-ebeb8e9e8955"

# Check for recent inbound calls (last 30 min)
CALLS=$(curl -s "https://api.vapi.ai/call?limit=10&phoneNumberId=$PHONE_ID" \
  -H "Authorization: Bearer $VAPI_KEY" | \
  python3 -c "
import json, sys
from datetime import datetime, timedelta, timezone

data = json.load(sys.stdin)
now = datetime.now(timezone.utc)
cutoff = now - timedelta(minutes=30)
alerts = []

for call in data:
    if call.get('type') == 'inboundPhoneCall':
        created = datetime.fromisoformat(call['createdAt'].replace('Z','+00:00'))
        if created > cutoff:
            customer = call.get('customer', {}).get('number', 'unknown')
            status = call.get('status', 'unknown')
            transcript = call.get('transcript', '')
            
            # Check for high-intent keywords
            high_intent = any(kw in transcript.lower() for kw in ['price', 'how much', 'call me', 'interested', 'yes', 'deal', 'offer', 'sell', 'ready'])
            
            alerts.append({
                'number': customer,
                'status': status,
                'high_intent': high_intent,
                'id': call.get('id', ''),
                'time': call['createdAt']
            })

if alerts:
    for a in alerts:
        intent = 'HIGH INTENT' if a['high_intent'] else 'inbound'
        print(f'ALERT|{intent}|{a[\"number\"]}|{a[\"status\"]}|{a[\"id\"]}|{a[\"time\"]}')
else:
    print('NO_ALERTS')
")

echo "$CALLS"

# Also check Copeland VM drop status
echo "---"
echo "COPELAND_VM_CHECK:"
curl -s "https://api.vapi.ai/call/019d21f7-eaee-7000-8d2f-0ae11f1a657a" \
  -H "Authorization: Bearer $VAPI_KEY" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Status: {data.get(\"status\", \"unknown\")}')
print(f'End reason: {data.get(\"endedReason\", \"in progress\")}')
print(f'Duration: {data.get(\"duration\", 0)}s')
print(f'Cost: \${data.get(\"cost\", 0):.4f}')
"
