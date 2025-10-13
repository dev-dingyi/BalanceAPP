# Installation Checklist

Complete these steps to get the Balance App running.

## ✅ Pre-Installation (What I've Done)

- [x] Created React + TypeScript project with Vite
- [x] Installed all dependencies (Firebase, MUI, Zustand, etc.)
- [x] Set up project structure
- [x] Implemented authentication system
- [x] Created dual-language support (EN/CN)
- [x] Built responsive layout and navigation
- [x] Created Firestore security rules file
- [x] Application builds successfully

## 🔲 Your Turn (What You Need To Do)

### 1. Install Firebase CLI (5 minutes)
```bash
npm install -g firebase-tools
```
- [ ] Firebase CLI installed
- [ ] Verified with `firebase --version`

### 2. Create Firebase Project (3 minutes)
Go to: https://console.firebase.google.com/

- [ ] Created new Firebase project
- [ ] Project name: _______________

### 3. Enable Firebase Services (5 minutes)
In Firebase Console:

**Authentication:**
- [ ] Opened Authentication section
- [ ] Clicked "Get started"
- [ ] Enabled "Email/Password" sign-in method

**Firestore Database:**
- [ ] Opened Firestore Database section
- [ ] Created database in test mode
- [ ] Selected region: _______________

### 4. Get Firebase Configuration (2 minutes)
In Firebase Console → Project Settings → Your apps:

- [ ] Added web app
- [ ] Copied Firebase config object
- [ ] Have API key, Auth Domain, Project ID, etc.

### 5. Configure Environment Variables (2 minutes)
```bash
cd web-app
cp .env.example .env
# Edit .env with your Firebase credentials
```

- [ ] Created `.env` file in `web-app` directory
- [ ] Added VITE_FIREBASE_API_KEY
- [ ] Added VITE_FIREBASE_AUTH_DOMAIN
- [ ] Added VITE_FIREBASE_PROJECT_ID
- [ ] Added VITE_FIREBASE_STORAGE_BUCKET
- [ ] Added VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] Added VITE_FIREBASE_APP_ID

### 6. Initialize Firebase (5 minutes)
From project root:
```bash
firebase login
firebase init
```

Select these options:
- [ ] Selected "Firestore" and "Hosting"
- [ ] Chose existing project
- [ ] Public directory: `web-app/dist`
- [ ] Single-page app: Yes
- [ ] Created `.firebaserc` file

### 7. Deploy Firestore Rules (1 minute)
```bash
firebase deploy --only firestore:rules
```

- [ ] Firestore rules deployed successfully

### 8. Install and Start (2 minutes)
```bash
cd web-app
npm install
npm run dev
```

- [ ] Dependencies installed
- [ ] Dev server started
- [ ] App opened in browser (http://localhost:5173)

### 9. Test the App (5 minutes)
- [ ] Created test account (sign up)
- [ ] Logged in successfully
- [ ] Saw onboarding screen
- [ ] Selected language and currency
- [ ] Reached dashboard
- [ ] Can navigate between pages
- [ ] Can log out

## 📝 Configuration Summary

Fill this out as you go:

- **Firebase Project ID:** _______________
- **Firebase Region:** _______________
- **Preferred Currency:** USD / CNY
- **Preferred Language:** EN / CN
- **Dev Server Port:** 5173

## ⚠️ Common Issues & Solutions

**Issue: "Firebase: Error (auth/configuration-not-found)"**
- Solution: Check `.env` file is in `web-app` directory
- Verify all Firebase credentials are correct

**Issue: "Permission denied" in Firestore**
- Solution: Run `firebase deploy --only firestore:rules`

**Issue: Dev server won't start**
- Solution: Delete `node_modules`, run `npm install` again

**Issue: Import errors or build fails**
- Solution: Make sure you're in the `web-app` directory
- Run `npm install` again

## 🎉 Success Criteria

You're ready when:
- ✅ Can sign up and log in
- ✅ Dashboard loads without errors
- ✅ Can switch languages
- ✅ Navigation works
- ✅ No console errors

## 📚 Documentation Files

- **QUICKSTART.md** - Fast setup guide
- **SETUP.md** - Detailed step-by-step instructions
- **README.md** - Full project documentation
- **This file** - Installation checklist

## 🚀 After Installation

Once everything works, we can proceed to:
1. **Phase 2:** Transaction management
2. **Phase 3:** Category system
3. **Phase 4:** Budget tracking
4. **Phase 5:** AI features
5. **Phase 6:** Stealth mode

---

**Questions?** Check SETUP.md for detailed instructions or let me know what's not working!
