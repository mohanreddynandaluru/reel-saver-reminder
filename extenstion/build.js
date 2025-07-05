#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 🔨 Building Firebase bundle for Chrome Extension...

try {
  // Check if node_modules exists, if not install dependencies
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    // 📦 Installing dependencies...
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  }

  // Build the Firebase bundle
  // 📦 Bundling Firebase...
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });

  // ✅ Firebase bundle created successfully!
  // 📁 Bundle location: firebase-bundle.js
  // 🚀 You can now load the extension in Chrome
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 