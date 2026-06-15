#!/bin/bash
# Rep Legend — Cloudflare Worker Deploy Script
# Double-click this file to run in Terminal

cd "/Users/owner/Claude/Projects/Rep Legend/deploy/worker"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Rep Legend — Worker Deploy         ║"
echo "╚══════════════════════════════════════╝"
echo ""

echo "► Step 1: Login to Cloudflare (opens browser)..."
npx wrangler login

echo ""
echo "► Step 2: Setting RL_SECRET..."
printf 'RepLegend-AI-2024!' | npx wrangler secret put RL_SECRET

echo ""
echo "► Step 3: Deploying Worker..."
npx wrangler deploy

echo ""
echo "✅ Done! Your Worker URL is above."
echo "   Copy it → paste into the app's AI setup bar."
echo "   Secret: RepLegend-AI-2024!"
echo ""
read -p "Press Enter to close..."
