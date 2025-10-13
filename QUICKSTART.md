# Quick Start Guide

## First Time Setup (5-10 minutes)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "balance-app")
4. Create project

### 3. Enable Services in Firebase Console
- **Authentication**: Enable "Email/Password"
- **Firestore**: Create database in test mode

### 4. Get Firebase Config
1. Project Settings → Your apps → Web app
2. Copy the config values

### 5. Set Up Environment Variables
```bash
cd web-app
cp .env.example .env
# Edit .env and paste your Firebase credentials
```

### 6. Login and Initialize Firebase
```bash
# From project root
firebase login
firebase init

# Select:
# - Firestore
# - Hosting
# - Use existing project (select yours)
# - Public directory: web-app/dist
# - Single-page app: Yes
```

### 7. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 8. Start Development
```bash
cd web-app
npm install
npm run dev
```

Open http://localhost:5173

## Daily Development

```bash
cd web-app
npm run dev
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Firebase
firebase deploy                        # Deploy everything
firebase deploy --only hosting         # Deploy hosting only
firebase deploy --only firestore:rules # Deploy rules only
```

## Troubleshooting

**Can't connect to Firebase?**
- Check your `.env` file exists in `web-app` directory
- Verify all Firebase credentials are correct

**Permission denied errors?**
- Deploy Firestore rules: `firebase deploy --only firestore:rules`

**Port 5173 already in use?**
- The dev server will automatically use the next available port
- Or kill the process using port 5173

## What's Next?

After setup is complete, the app has:
- ✅ User authentication (sign up/login)
- ✅ Dashboard layout
- ✅ Language switcher (EN/CN)
- ✅ Currency selector (USD/CNY)

Ready to implement:
- 🚧 Transaction management
- 🚧 Category management
- 🚧 Budget tracking
- 🚧 AI features
- 🚧 Stealth mode

See [README.md](README.md) for full documentation.
