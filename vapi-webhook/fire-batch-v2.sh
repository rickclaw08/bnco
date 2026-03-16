#!/bin/bash
# Fire a batch of VAPI outbound calls with 30s spacing
# V2: passes email + company through customer metadata for webhook follow-up
# Usage: fire-batch-v2.sh <batch-file.json>
# Batch file format: [{"name":"John","phone":"+1234567890","trade":"Plumber","email":"john@co.com","company":"Acme Plumbing"}]

source ~/.zshrc 2>/dev/null
VAPI_KEY="${VAPI_API_KEY:-d9ca90ef-0dc2-464a-9c06-ca0163d8d805}"
ASSISTANT_ID="a036984d-72d5-4609-b392-6a635d49f6dd"
PHONE_ID="a3f8afe1-3db7-4dc4-b649-f07bce74ea38"
BATCH_FILE="$1"
DELAY=30
LOGDIR="/Users/agentclaw/.openclaw/workspace/vapi-webhook/logs"
mkdir -p "$LOGDIR"
LOG_FILE="$LOGDIR/calls-$(date +%Y%m%d-%H%M).json"

if [ ! -f "$BATCH_FILE" ]; then
  echo "File not found: $BATCH_FILE"
  exit 1
fi

echo "[]" > "$LOG_FILE"
TOTAL=$(jq length "$BATCH_FILE")
echo "[$(date)] Starting batch of $TOTAL calls from $BATCH_FILE"

for i in $(seq 0 $((TOTAL - 1))); do
  NAME=$(jq -r ".[$i].name // \"\"" "$BATCH_FILE")
  PHONE=$(jq -r ".[$i].phone" "$BATCH_FILE")
  TRADE=$(jq -r ".[$i].trade // \"\"" "$BATCH_FILE")
  EMAIL=$(jq -r ".[$i].email // \"\"" "$BATCH_FILE")
  COMPANY=$(jq -r ".[$i].company // \"\"" "$BATCH_FILE")

  echo "[$((i+1))/$TOTAL] Calling $NAME ($PHONE) - $TRADE..."

  # Build customer object with metadata
  CUSTOMER_JSON=$(jq -n \
    --arg number "$PHONE" \
    --arg name "$NAME" \
    '{number: $number, name: $name}')

  RESULT=$(curl -s -X POST "https://api.vapi.ai/call/phone" \
    -H "Authorization: Bearer $VAPI_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"assistantId\": \"$ASSISTANT_ID\",
      \"phoneNumberId\": \"$PHONE_ID\",
      \"customer\": $CUSTOMER_JSON,
      \"assistantOverrides\": {
        \"variableValues\": {
          \"customerName\": \"$NAME\",
          \"trade\": \"$TRADE\",
          \"customerEmail\": \"$EMAIL\",
          \"customerCompany\": \"$COMPANY\"
        }
      }
    }")

  CALL_ID=$(echo "$RESULT" | jq -r '.id // "FAILED"')
  STATUS=$(echo "$RESULT" | jq -r '.status // "error"')

  if [ "$CALL_ID" != "FAILED" ]; then
    echo "  -> Queued ($CALL_ID) email=$EMAIL"
  else
    echo "  -> FAILED: $(echo "$RESULT" | jq -r '.message // .error // "unknown"')"
  fi

  jq ". += [{\"name\": \"$NAME\", \"phone\": \"$PHONE\", \"trade\": \"$TRADE\", \"email\": \"$EMAIL\", \"company\": \"$COMPANY\", \"callId\": \"$CALL_ID\", \"status\": \"$STATUS\", \"time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}]" "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"

  if [ $i -lt $((TOTAL - 1)) ]; then
    sleep $DELAY
  fi
done

echo "[$(date)] Batch complete. Log: $LOG_FILE"
