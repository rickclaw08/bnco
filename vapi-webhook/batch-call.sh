#!/bin/bash
# Batch outbound caller for VAPI
# Usage: ./batch-call.sh batch-20.json
# Calls are spaced 30 seconds apart to avoid flooding

VAPI_KEY="$VAPI_API_KEY"
ASSISTANT_ID="a036984d-72d5-4609-b392-6a635d49f6dd"
PHONE_ID="d462440c-9949-4df7-9b52-ebeb8e9e8955"
BATCH_FILE="${1:-batch-20.json}"
DELAY=${2:-30}
LOG_FILE="call-log-$(date +%Y%m%d-%H%M).json"

echo "[]" > "$LOG_FILE"
TOTAL=$(jq length "$BATCH_FILE")
echo "Starting batch of $TOTAL calls with ${DELAY}s delay..."
echo ""

for i in $(seq 0 $((TOTAL - 1))); do
  NAME=$(jq -r ".[$i].name" "$BATCH_FILE")
  PHONE=$(jq -r ".[$i].phone" "$BATCH_FILE")
  TRADE=$(jq -r ".[$i].trade" "$BATCH_FILE")
  
  echo "[$((i+1))/$TOTAL] Calling $NAME ($PHONE) - $TRADE..."
  
  RESULT=$(curl -s -X POST "https://api.vapi.ai/call/phone" \
    -H "Authorization: Bearer $VAPI_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"assistantId\": \"$ASSISTANT_ID\",
      \"phoneNumberId\": \"$PHONE_ID\",
      \"customer\": {
        \"number\": \"$PHONE\",
        \"name\": \"$NAME\"
      },
      \"assistantOverrides\": {
        \"variableValues\": {
          \"customerName\": \"$NAME\",
          \"trade\": \"$TRADE\"
        }
      }
    }")
  
  CALL_ID=$(echo "$RESULT" | jq -r '.id // "FAILED"')
  STATUS=$(echo "$RESULT" | jq -r '.status // "error"')
  ERROR=$(echo "$RESULT" | jq -r '.message // .error // "none"')
  
  if [ "$CALL_ID" != "FAILED" ]; then
    echo "  -> Queued (ID: $CALL_ID)"
  else
    echo "  -> FAILED: $ERROR"
  fi
  
  # Append to log
  jq ". += [{\"index\": $((i+1)), \"name\": \"$NAME\", \"phone\": \"$PHONE\", \"trade\": \"$TRADE\", \"callId\": \"$CALL_ID\", \"status\": \"$STATUS\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}]" "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
  
  # Wait between calls (skip delay on last call)
  if [ $i -lt $((TOTAL - 1)) ]; then
    echo "  Waiting ${DELAY}s..."
    sleep $DELAY
  fi
done

echo ""
echo "Batch complete. Log: $LOG_FILE"
SUCCEEDED=$(jq '[.[] | select(.callId != "FAILED")] | length' "$LOG_FILE")
FAILED=$(jq '[.[] | select(.callId == "FAILED")] | length' "$LOG_FILE")
echo "Results: $SUCCEEDED queued, $FAILED failed"
