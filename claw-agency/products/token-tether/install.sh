#!/usr/bin/env bash

# ============================================================================
# TokenTether - Interactive Setup Script
# ============================================================================
#
# This script:
#   1. Checks prerequisites (Node.js 18+, Docker optional)
#   2. Installs npm dependencies
#   3. Creates .env from .env.example with interactive prompts
#   4. Launches TokenTether
#   5. Validates the connection to the OpenClaw gateway
#
# Usage:
#   chmod +x install.sh
#   ./install.sh
#
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# ============================================================================
# Helper functions
# ============================================================================

info() {
  echo -e "${CYAN}[INFO]${RESET} $*"
}

success() {
  echo -e "${GREEN}[OK]${RESET}   $*"
}

warn() {
  echo -e "${YELLOW}[WARN]${RESET} $*"
}

fail() {
  echo -e "${RED}[FAIL]${RESET} $*"
  exit 1
}

prompt() {
  local message="$1"
  local default="$2"
  local result

  echo -en "${BOLD}${message}${RESET} ${DIM}[${default}]${RESET}: "
  read -r result
  echo "${result:-$default}"
}

divider() {
  echo -e "${DIM}$(printf '=%.0s' {1..60})${RESET}"
}

# ============================================================================
# Banner
# ============================================================================

clear 2>/dev/null || true
echo ""
echo -e "${GREEN}${BOLD}"
echo "  ╔════════════════════════════════════════════╗"
echo "  ║   TokenTether v1.0.0 - Setup              ║"
echo "  ║   Hard-Stop Billing Controller for OpenClaw║"
echo "  ╚════════════════════════════════════════════╝"
echo -e "${RESET}"
echo ""

# ============================================================================
# Step 1: Check prerequisites
# ============================================================================

divider
echo -e "${BOLD}Step 1: Checking prerequisites${RESET}"
divider
echo ""

# Check Node.js
if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 18 ]; then
    success "Node.js $NODE_VERSION found"
  else
    fail "Node.js 18+ required, found $NODE_VERSION. Please upgrade: https://nodejs.org"
  fi
else
  fail "Node.js not found. Install it from https://nodejs.org (v18 or later)"
fi

# Check npm
if command -v npm &>/dev/null; then
  NPM_VERSION=$(npm -v)
  success "npm $NPM_VERSION found"
else
  fail "npm not found. It should come with Node.js."
fi

# Check Docker (optional)
if command -v docker &>/dev/null; then
  DOCKER_VERSION=$(docker --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown")
  success "Docker $DOCKER_VERSION found (optional, for containerized deployment)"
  HAS_DOCKER=true
else
  warn "Docker not found (optional - you can run TokenTether directly with Node.js)"
  HAS_DOCKER=false
fi

echo ""

# ============================================================================
# Step 2: Install dependencies
# ============================================================================

divider
echo -e "${BOLD}Step 2: Installing dependencies${RESET}"
divider
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f "package.json" ]; then
  info "Installing npm packages..."
  npm install --production 2>&1 | tail -5
  success "Dependencies installed"
else
  fail "package.json not found. Are you running this from the TokenTether directory?"
fi

echo ""

# ============================================================================
# Step 3: Configure .env
# ============================================================================

divider
echo -e "${BOLD}Step 3: Configuration${RESET}"
divider
echo ""

if [ -f ".env" ]; then
  warn ".env file already exists."
  OVERWRITE=$(prompt "Overwrite with new configuration? (y/n)" "n")
  if [ "$OVERWRITE" != "y" ] && [ "$OVERWRITE" != "Y" ]; then
    info "Keeping existing .env"
    SKIP_CONFIG=true
  else
    SKIP_CONFIG=false
  fi
else
  SKIP_CONFIG=false
fi

if [ "$SKIP_CONFIG" = "false" ]; then
  info "Let's configure your spending limits."
  echo ""

  HARD_LIMIT=$(prompt "Hard spending limit (USD per period)" "50.00")
  SESSION_LIMIT=$(prompt "Per-session spending limit (USD)" "10.00")
  WARN_PCT=$(prompt "Warning threshold (0.0-1.0, e.g., 0.80 = 80%)" "0.80")
  RESET=$(prompt "Reset interval (1h/24h/7d/30d/never)" "24h")
  GATEWAY_HOST=$(prompt "OpenClaw gateway host" "127.0.0.1")
  GATEWAY_PORT=$(prompt "OpenClaw gateway port" "18789")
  PROXY_PORT=$(prompt "TokenTether proxy port" "18788")

  echo ""
  info "Alert configuration (leave empty to skip):"
  WEBHOOK=$(prompt "Webhook URL (Slack/Discord)" "")
  ALERT_EMAIL=$(prompt "Alert email address" "")

  # Create .env from template
  cp .env.example .env

  # Update values using sed
  sed -i.bak "s/^TT_HARD_LIMIT_USD=.*/TT_HARD_LIMIT_USD=$HARD_LIMIT/" .env
  sed -i.bak "s/^TT_SESSION_LIMIT_USD=.*/TT_SESSION_LIMIT_USD=$SESSION_LIMIT/" .env
  sed -i.bak "s/^TT_WARN_THRESHOLD_PCT=.*/TT_WARN_THRESHOLD_PCT=$WARN_PCT/" .env
  sed -i.bak "s/^TT_RESET_INTERVAL=.*/TT_RESET_INTERVAL=$RESET/" .env
  sed -i.bak "s/^TT_GATEWAY_HOST=.*/TT_GATEWAY_HOST=$GATEWAY_HOST/" .env
  sed -i.bak "s/^TT_GATEWAY_PORT=.*/TT_GATEWAY_PORT=$GATEWAY_PORT/" .env
  sed -i.bak "s/^TT_PROXY_PORT=.*/TT_PROXY_PORT=$PROXY_PORT/" .env

  if [ -n "$WEBHOOK" ]; then
    sed -i.bak "s|^TT_WEBHOOK_URL=.*|TT_WEBHOOK_URL=$WEBHOOK|" .env
  fi
  if [ -n "$ALERT_EMAIL" ]; then
    sed -i.bak "s/^TT_ALERT_EMAIL=.*/TT_ALERT_EMAIL=$ALERT_EMAIL/" .env
  fi

  # Clean up backup files from sed -i
  rm -f .env.bak

  success "Configuration saved to .env"
fi

echo ""

# ============================================================================
# Step 4: Create data directory
# ============================================================================

mkdir -p data
success "Data directory created"

echo ""

# ============================================================================
# Step 5: Launch TokenTether
# ============================================================================

divider
echo -e "${BOLD}Step 4: Launch${RESET}"
divider
echo ""

LAUNCH_METHOD="node"
if [ "$HAS_DOCKER" = "true" ]; then
  DOCKER_CHOICE=$(prompt "Launch with Docker or Node.js? (docker/node)" "node")
  LAUNCH_METHOD="$DOCKER_CHOICE"
fi

if [ "$LAUNCH_METHOD" = "docker" ]; then
  info "Starting TokenTether with Docker..."
  docker compose up -d --build 2>&1 | tail -10
  success "TokenTether container started"
  sleep 3
else
  info "Starting TokenTether with Node.js..."
  # Start in background so we can validate
  node src/index.js &
  TT_PID=$!
  sleep 2

  # Check if it's still running
  if kill -0 "$TT_PID" 2>/dev/null; then
    success "TokenTether started (PID: $TT_PID)"
  else
    fail "TokenTether failed to start. Check the output above for errors."
  fi
fi

echo ""

# ============================================================================
# Step 6: Validate connection
# ============================================================================

divider
echo -e "${BOLD}Step 5: Validation${RESET}"
divider
echo ""

PROXY_PORT_VAL=$(grep "^TT_PROXY_PORT=" .env 2>/dev/null | cut -d= -f2 || echo "18788")

info "Checking TokenTether health endpoint..."
sleep 1

if command -v curl &>/dev/null; then
  HEALTH_RESPONSE=$(curl -s "http://localhost:${PROXY_PORT_VAL}/health" 2>/dev/null || echo "")
  if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    success "TokenTether is healthy and responding"
    echo ""
    echo -e "  ${DIM}$HEALTH_RESPONSE${RESET}"
  else
    warn "Could not reach TokenTether health endpoint. It may still be starting up."
    warn "Try: curl http://localhost:${PROXY_PORT_VAL}/health"
  fi
else
  warn "curl not found, skipping health check. Check manually:"
  warn "  curl http://localhost:${PROXY_PORT_VAL}/health"
fi

echo ""

# ============================================================================
# Done!
# ============================================================================

divider
echo ""
echo -e "${GREEN}${BOLD}  Setup complete!${RESET}"
echo ""
echo -e "  ${BOLD}Proxy:${RESET}     http://localhost:${PROXY_PORT_VAL}"
echo -e "  ${BOLD}Dashboard:${RESET} http://localhost:18790"
echo -e "  ${BOLD}Health:${RESET}    http://localhost:${PROXY_PORT_VAL}/health"
echo ""
echo -e "  ${BOLD}Next steps:${RESET}"
echo -e "  1. Point your OpenClaw clients to port ${PROXY_PORT_VAL}"
echo -e "     (instead of connecting directly to the gateway on 18789)"
echo -e "  2. Open the dashboard to monitor spending in real time"
echo -e "  3. Set up webhook/email alerts for production use"
echo ""
if [ -n "${TT_PID:-}" ]; then
  echo -e "  ${DIM}To stop: kill ${TT_PID} (or docker compose down)${RESET}"
else
  echo -e "  ${DIM}To stop: docker compose down${RESET}"
fi
echo ""
divider
