#!/bin/bash

# BalanceApp Deployment Script
# This script builds and deploys the app to Firebase Hosting

set -e  # Exit on any error

echo "🚀 BalanceApp Deployment Script"
echo "================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Navigate to web-app directory
cd web-app

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building application..."
npm run build

echo "✅ Build complete!"
echo ""

# Go back to root
cd ..

echo "📤 Deploying to Firebase..."
echo ""

# Deploy Firestore rules first
echo "1️⃣  Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy hosting
echo "2️⃣  Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is now live at:"
firebase hosting:channel:list | grep -A 1 "live" || firebase hosting:sites:list
echo ""
echo "🎉 Done!"
