# Troubleshooting Guide

## ✅ Fixed: Blank Page Issue

**Problem:** You pasted the Firebase JavaScript code into the `.env` file instead of environment variables.

**Solution:** I've corrected your `.env` file. It now has the proper format:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
...
```

## 🔄 What You Need to Do Now

### 1. Stop the Dev Server (if running)
Press `Ctrl + C` in the terminal where the dev server is running.

### 2. Restart the Dev Server
```bash
# From project root
npm run dev

# OR from web-app directory
cd web-app
npm run dev
```

### 3. Open Browser
Go to: http://localhost:5173

### 4. You Should See
- **Login page** - If not logged in
- **OR redirect to Dashboard** - If already logged in

## 🔍 If Still Blank - Check These

### Check Browser Console
1. Open browser developer tools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Look for errors in red

**Common errors you might see:**

#### Error: "Firebase: Error (auth/invalid-api-key)"
**Fix:** Your Firebase API key is wrong. Get it from:
- Firebase Console → Project Settings → Your apps

#### Error: "FirebaseError: Missing or insufficient permissions"
**Fix:** You need to enable services in Firebase:

1. **Enable Authentication:**
   - Go to: https://console.firebase.google.com/project/studio-7571176442-16270/authentication
   - Click "Get started"
   - Enable "Email/Password"

2. **Create Firestore Database:**
   - Go to: https://console.firebase.google.com/project/studio-7571176442-16270/firestore
   - Click "Create database"
   - Choose "Start in test mode"
   - Select region
   - Click "Enable"

#### Error: Network errors
**Fix:** Check your internet connection and Firebase project status.

### Check .env File Location
```bash
# Should be at this location:
ls -la /Users/dingyi/Projects/BalanceAPP/web-app/.env

# Should show the file exists
```

### Check .env File Contents
```bash
cat /Users/dingyi/Projects/BalanceAPP/web-app/.env

# Should show:
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# etc.
```

## 🎯 Complete Setup Checklist

Make sure you've done ALL of these in Firebase Console:

- [ ] Created Firebase project
- [ ] **Enabled Authentication** (Email/Password method)
- [ ] **Created Firestore Database** (test mode is fine for now)
- [ ] Got Firebase config from Project Settings
- [ ] Pasted config into `.env` file (correctly formatted)
- [ ] Restarted dev server after creating `.env`

## 🔥 Firebase Console Quick Links

Based on your project ID: `studio-7571176442-16270`

- **Project Overview:** https://console.firebase.google.com/project/studio-7571176442-16270
- **Authentication:** https://console.firebase.google.com/project/studio-7571176442-16270/authentication
- **Firestore Database:** https://console.firebase.google.com/project/studio-7571176442-16270/firestore
- **Project Settings:** https://console.firebase.google.com/project/studio-7571176442-16270/settings/general

## 🐛 Debug Mode

If you want to see detailed Firebase logs, add this to your `.env`:

```bash
VITE_FIREBASE_DEBUG=true
```

Then restart the server.

## 📸 What You Should See

### First Visit (Not Logged In)
```
┌─────────────────────────────────────┐
│         Balance                     │
│                                     │
│         Sign In                     │
│                                     │
│  Email: [____________]             │
│  Password: [____________]          │
│                                     │
│  [ Sign In ]                       │
│                                     │
│  Don't have an account? Sign Up    │
└─────────────────────────────────────┘
```

### After Signing Up
```
┌─────────────────────────────────────┐
│         Welcome to Balance          │
│                                     │
│  Select Your Language               │
│  [ English ▼ ]                     │
│                                     │
│  Select Your Primary Currency       │
│  [ USD ($) ▼ ]                     │
│                                     │
│  [ Get Started ]                   │
└─────────────────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────┐
│  Balance  [Dashboard] [Categories]  │
│                                     │
│  Dashboard         [+ Add Trans.]   │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Total │ │Budget│ │Categ.│       │
│  │$0.00 │ │  0%  │ │  0   │       │
│  └──────┘ └──────┘ └──────┘       │
└─────────────────────────────────────┘
```

## 🆘 Still Not Working?

Try these steps in order:

1. **Clear browser cache and reload**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

2. **Check terminal output**
   - Look for errors in the terminal running the dev server
   - Common: port already in use, module not found

3. **Reinstall dependencies**
   ```bash
   npm run clean
   npm run install:all
   npm run dev
   ```

4. **Check Firebase project status**
   - Is the project active?
   - Are billing and quotas OK?

5. **Try a different browser**
   - Chrome, Firefox, Safari - try another

## 📝 Reporting Issues

If still stuck, provide:
1. Screenshot of browser page (blank or error)
2. Browser console errors (F12 → Console tab)
3. Terminal output where dev server is running
4. Output of: `cat web-app/.env` (remove sensitive keys if sharing)

---

**Most Common Fix:** Restart the dev server after changing `.env` file!
