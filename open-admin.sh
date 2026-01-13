#!/bin/bash

# Quick script to open admin panel in browser
# Usage: bash open-admin.sh

echo "🚀 Opening Admin Panel..."

# Detect OS and open browser
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "https://nexusinvest-9c2bd.web.app/admin-login.html"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "https://nexusinvest-9c2bd.web.app/admin-login.html"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start "https://nexusinvest-9c2bd.web.app/admin-login.html"
else
    echo "❌ Could not detect OS. Please open manually:"
    echo "https://nexusinvest-9c2bd.web.app/admin-login.html"
fi

echo "✅ Admin panel should open in your browser!"
