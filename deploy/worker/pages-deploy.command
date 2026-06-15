#!/bin/bash
# Rep Legend — Cloudflare Pages Deploy
# Double-click to run

cd "/Users/owner/Claude/Projects/Rep Legend"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Rep Legend — Cloudflare Pages      ║"
echo "╚══════════════════════════════════════╝"
echo ""

echo "► Deploying to Cloudflare Pages..."
npx wrangler pages deploy deploy \
  --project-name rep-legend \
  --commit-dirty=true

echo ""
echo "✅ Done! Your Pages URL is above."
echo "   (usually https://rep-legend.pages.dev)"
echo ""
read -p "Press Enter to close..."
