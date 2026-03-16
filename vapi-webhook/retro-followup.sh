#!/bin/bash
# Send follow-up emails to today's batch that had no email follow-up
# Usage: retro-followup.sh <contacts.json>
# Format: [{"email":"x@y.com","name":"John","company":"Acme","callType":"voicemail"}]
# callType: conversation, gatekeeper, voicemail, no-answer, busy, rejected

WEBHOOK_URL="https://clawops-vapi-webhook.fly.dev"

if [ -z "$1" ]; then
  echo "Usage: retro-followup.sh <contacts.json>"
  echo ""
  echo "Format: [{\"email\":\"x@y.com\",\"name\":\"John\",\"company\":\"Acme Plumbing\",\"callType\":\"voicemail\"}]"
  echo ""
  echo "callType options: conversation, gatekeeper, voicemail, no-answer"
  exit 1
fi

echo "Sending batch follow-up emails..."
RESULT=$(curl -s -X POST "$WEBHOOK_URL/batch-followup" \
  -H "Content-Type: application/json" \
  -d @"$1")

echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
