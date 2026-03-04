#!/bin/bash
set -e

echo "=== BNCO iOS Build ==="

echo "1. Building Vite project..."
npx vite build

echo "2. Syncing with Capacitor..."
npx cap sync ios

echo "3. Opening Xcode..."
npx cap open ios

echo "=== Done! ==="
