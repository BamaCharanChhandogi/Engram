#!/bin/bash
set +e # Never exit on error automatically

LOG_DIR="$HOME/.engram"
LOG_FILE="$LOG_DIR/error.log"
mkdir -p "$LOG_DIR" 2>/dev/null

log_error() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1" >> "$LOG_FILE" 2>/dev/null
}

# Read stdin with timeout
INPUT_DATA=""
if [ ! -t 0 ]; then
    # Read from pipe if available
    INPUT_DATA=$(cat)
fi

API_URL="${ENGRAM_API:-${DEVPRACTICE_API:-http://localhost:3000}}"
ENDPOINT="${API_URL%/}/api/capture"
TOKEN="${ENGRAM_TOKEN:-${DEVPRACTICE_TOKEN:-}}"

# Minimal payload construction
EVENT_TYPE="${ENGRAM_EVENT:-${DEVPRACTICE_EVENT:-unknown}}"
TOOL="${ENGRAM_TOOL:-${DEVPRACTICE_TOOL:-unknown}}"
SESSION="${ENGRAM_SESSION:-${DEVPRACTICE_SESSION:-unknown}}"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Basic JSON payload with raw input text
PAYLOAD=$(cat <<EOF
{
  "event_type": "$EVENT_TYPE",
  "tool": "$TOOL",
  "payload": { "raw_bash": "$(echo "$INPUT_DATA" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')" },
  "session_id": "$SESSION",
  "captured_at": "$NOW"
}
EOF
)

AUTH_HEADER=""
if [ -n "$TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $TOKEN"
fi

if [ -n "$AUTH_HEADER" ]; then
    curl -s -X POST -H "Content-Type: application/json" -H "$AUTH_HEADER" -d "$PAYLOAD" --max-time 5 "$ENDPOINT" > /dev/null 2>> "$LOG_FILE" || log_error "curl failed"
else
    curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" --max-time 5 "$ENDPOINT" > /dev/null 2>> "$LOG_FILE" || log_error "curl failed"
fi

exit 0
