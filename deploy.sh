#!/bin/bash
# ═══════════════════════════════════════════════════════
#  Rep Legend — SSH Deploy Script
#  Usage: ./deploy.sh
#  Requires: .deploy.env (fill in once, never commit it)
# ═══════════════════════════════════════════════════════

set -e

# Load config
ENV_FILE="$(dirname "$0")/.deploy.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌  .deploy.env not found. Copy .deploy.env.example and fill it in."
  exit 1
fi
source "$ENV_FILE"

# Validate required vars
: "${SERVER_HOST:?Set SERVER_HOST in .deploy.env}"
: "${SERVER_USER:?Set SERVER_USER in .deploy.env}"
: "${SERVER_PATH:?Set SERVER_PATH in .deploy.env}"

LOCAL_DIR="$(dirname "$0")/rep-legend-handoff/"

echo ""
echo "⚡  Rep Legend — Deploying to ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}"
echo "────────────────────────────────────────────────────"

# Optional: test connection first
ssh -q -o "BatchMode=yes" -o "ConnectTimeout=5" \
  ${SSH_KEY:+-i "$SSH_KEY"} \
  "${SERVER_USER}@${SERVER_HOST}" exit 2>/dev/null \
  || { echo "❌  Cannot reach ${SERVER_HOST}. Check your credentials."; exit 1; }

# Ensure remote directory exists
ssh ${SSH_KEY:+-i "$SSH_KEY"} "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${SERVER_PATH}"

# Rsync — fast, only sends changed files
rsync -avz --progress --delete \
  ${SSH_KEY:+-e "ssh -i $SSH_KEY"} \
  "$LOCAL_DIR" \
  "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}"

echo ""
echo "✅  Deploy complete!"
echo "    https://${SERVER_HOST}"
echo ""
