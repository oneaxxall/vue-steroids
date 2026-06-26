#!/bin/bash

# ============================================
# Vue Steroids - Quick Start
# ============================================
# Usage: bash run.sh
# 
# Menjalankan development server dengan:
#   - HTTP server (port 8000)
#   - HMR WebSocket (port 8003)  
#   - TailwindCSS watch
# ============================================

echo ""
echo "============================================"
echo "  Vue Steroids Boilerplate - Quick Start"
echo "============================================"
echo ""

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "[1/4] Installing dependencies..."
    npm install
else
    echo "[1/4] Dependencies already installed"
fi

# Check if vue.js exists (copy from dist if needed)
if [ ! -f "public/js/vue/vue.js" ] || [ ! -s "public/js/vue/vue.js" ]; then
    echo "[2/4] Copying Vue.js..."
    if [ -f "../dist/vue.js" ]; then
        cp ../dist/vue.js public/js/vue/vue.js
        echo "  ✅ Copied from dist/vue.js"
    else
        echo "  ⚠️  dist/vue.js not found. Run 'npm run build' in root first."
    fi
else
    echo "[2/4] Vue.js already exists"
fi

# Build TailwindCSS
if [ ! -f "public/css/tailwind.css" ] || [ ! -s "public/css/tailwind.css" ]; then
    echo "[3/4] Building TailwindCSS..."
    npm run tailwind:build 2>/dev/null || echo "  ⚠️  Tailwind build skipped, check config"
else
    echo "[3/4] TailwindCSS already built"
fi

# Start dev server
echo "[4/4] Starting development server..."
echo ""
echo "============================================"
echo "  Dev Server: http://localhost:8000"
echo "  HMR       : ws://localhost:8003"
echo "============================================"
echo ""

node serve.js
