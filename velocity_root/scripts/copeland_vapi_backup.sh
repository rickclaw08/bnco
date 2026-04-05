#!/bin/bash
# Copeland VAPI Voicemail Drop - 4:00 PM
# Purpose: Leave voicemail only. If human answers, deliver brief message and end call.
# Brand's order: Text-only day, no live calls. This is VM drop only.

VAPI_KEY="d9ca90ef-0dc2-464a-9c06-ca0163d8d805"
AGENT_ID="094c420d-e27f-484e-895a-399d2dfb5592"
PHONE_NUMBER_ID="d462440c-9949-4df7-9b52-ebeb8e9e8955"

# Copeland details
CUSTOMER_NUMBER="+15137610275"
OWNER_NAME="Joseph"
PROPERTY_ADDRESS="1318 Woodland Ave"
AUCTION_DATE="April 8th"

# Voicemail-focused override:
# - Short max duration (60s) so it doesn't become a long conversation
# - voicemailMessage override to use our script
# - If human answers, the firstMessage is the VM script itself (brief, ends naturally)
VM_FIRST_MSG="Hey Joseph, this is Brand. I'm a local investor here in Cincinnati. Calling about the property on 1318 Woodland Ave. I wanted to make sure you know about your options before the April 8th date. Give me a call back when you get a chance. 513-850-6496. Thanks."

curl -s -X POST "https://api.vapi.ai/call/phone" \
  -H "Authorization: Bearer $VAPI_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"assistantId\": \"$AGENT_ID\",
    \"phoneNumberId\": \"$PHONE_NUMBER_ID\",
    \"customer\": {
      \"number\": \"$CUSTOMER_NUMBER\"
    },
    \"assistantOverrides\": {
      \"variableValues\": {
        \"ownerName\": \"$OWNER_NAME\",
        \"propertyAddress\": \"$PROPERTY_ADDRESS\",
        \"auctionDate\": \"$AUCTION_DATE\"
      },
      \"firstMessage\": \"$VM_FIRST_MSG\",
      \"voicemailMessage\": \"$VM_FIRST_MSG\",
      \"maxDurationSeconds\": 60
    }
  }"

echo ""
echo "Copeland VAPI voicemail drop fired at $(date)"
