#!/bin/bash
# Rep Legend — delete git locks, commit all changes, push to GitHub
# Double-click this file in Finder to run it

cd "/Users/owner/Claude/Projects/Rep Legend"

echo ""
echo "🔓 Removing git lock files..."
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock .git/objects/maintenance.lock
echo "   Done."

echo ""
echo "📦 Staging all changes..."
git add -A -- ':!deploy.zip'

echo ""
echo "💾 Committing..."
git commit -m "feat: units toggle, exit button, sensor pre-prompt modal, signup.html, checkout.html, netlify.toml fix"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Netlify will auto-deploy in ~30 seconds."
echo "   Visit: https://rep-legend.netlify.app"
echo ""
read -p "Press Enter to close..."
