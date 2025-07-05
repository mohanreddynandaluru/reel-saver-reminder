# Insta Extension - Instagram Note Taking & Reminder Extension

A browser extension for Instagram that allows users to take notes and set reminders while browsing Instagram posts. Built with React, Node.js, and Firebase.

## 🚀 Features

- **Note Taking**: Save notes while browsing Instagram posts
- **Reminder System**: Set reminders for important posts or tasks
- **Firebase Authentication**: Secure user authentication
- **Cross-Platform**: Works on Chrome, Firefox, and Edge
- **Real-time Sync**: Notes and reminders sync across devices

## 📁 Project Structure

insta_entenstion/
├── backend/                 # Node.js Express server
│   ├── app.js              # Main server file
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── middlewares/        # Authentication middleware
│   └── reminderService.js  # Email reminder service
├── frontend/               # React frontend application
│   ├── frontend/           # React app
├── extenstion/            # Browser extension
│   ├── manifest.json      # Extension manifest
│   ├── popup.html         # Extension popup
│   ├── content.js         # Content script
│   ├── background.js      # Background script
│   └── firebase-*.js      # Firebase configuration
└── README.md              # This file



