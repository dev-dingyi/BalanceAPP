# BalanceApp Deployment Checklist

Use this checklist before each production deployment to ensure everything is properly configured and tested.

## Pre-Deployment Checklist

### 1. Environment Configuration ✓

- [ ] `.env.local` exists in `web-app/` directory
- [ ] All Firebase configuration variables are set
- [ ] `VITE_ANTHROPIC_API_KEY` is configured (if using AI features)
- [ ] No sensitive credentials are committed to Git
- [ ] `.env.local` is in `.gitignore`

### 2. Firebase Setup ✓

- [ ] Firebase project created (`balanceapp-c4534` or your project)
- [ ] Authentication enabled (Email/Password provider)
- [ ] Firestore Database created
- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Logged into Firebase CLI (`firebase login`)
- [ ] Correct project selected (`firebase use balanceapp-c4534`)

### 3. Code Quality ✓

- [ ] No console errors in browser DevTools
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No unused imports or variables
- [ ] All TODO comments addressed or documented

### 4. Local Testing ✓

- [ ] Development server runs without errors (`npm run dev`)
- [ ] Can sign up new user
- [ ] Can sign in existing user
- [ ] Can create transactions
- [ ] Can create categories
- [ ] Can create budgets
- [ ] Can create recurring transactions
- [ ] Analytics page loads correctly
- [ ] All charts display properly
- [ ] Export functions work (CSV, Excel, PDF)
- [ ] AI smart input works (if configured)
- [ ] Receipt scanning works
- [ ] Language switching works (English/Chinese)
- [ ] All navigation links work
- [ ] Mobile responsive design verified

### 5. Build Verification ✓

- [ ] Production build succeeds (`npm run build`)
- [ ] Build output in `web-app/dist/` directory
- [ ] Bundle size is reasonable (~440 KB expected)
- [ ] No build warnings or errors
- [ ] Preview build works (`npm run preview`)

### 6. Database & Security ✓

- [ ] `firestore.rules` updated with latest rules
- [ ] Security rules include all collections:
  - [ ] `transactions`
  - [ ] `categories`
  - [ ] `budgets`
  - [ ] `recurringTransactions`
  - [ ] `userSettings`
- [ ] Firestore indexes created (check console for index URLs)
- [ ] Test that users can only access their own data

---

## Deployment Steps

### Option A: Manual Deployment

#### Step 1: Build Application
```bash
cd web-app
npm ci
npm run build
cd ..
```
- [ ] Build completed successfully
- [ ] No errors in console

#### Step 2: Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```
- [ ] Deployment successful
- [ ] No rule syntax errors

#### Step 3: Deploy to Hosting
```bash
firebase deploy --only hosting
```
- [ ] Deployment successful
- [ ] Hosting URL displayed

#### Step 4: Verify Deployment
- [ ] Visit hosting URL
- [ ] Application loads
- [ ] No console errors

### Option B: Automated Deployment (Script)

```bash
./deploy.sh
```

- [ ] Script completes without errors
- [ ] Dependencies installed
- [ ] Build successful
- [ ] Firestore rules deployed
- [ ] Hosting deployed
- [ ] Live URL displayed

---

## GitHub Actions Setup (CI/CD)

### Initial Setup (One-Time)

#### 1. Configure GitHub Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions**

Add the following secrets:

- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID`
- [ ] `VITE_ANTHROPIC_API_KEY`
- [ ] `FIREBASE_TOKEN` (get via `firebase login:ci`)

#### 2. Verify Workflow File

- [ ] `.github/workflows/firebase-deploy.yml` exists
- [ ] Workflow triggers on push to `main`
- [ ] Workflow triggers on pull requests
- [ ] Workflow has correct secrets references

### Automated Deployment Process

#### For Pull Requests:
- [ ] PR opened
- [ ] GitHub Actions workflow starts
- [ ] Build completes
- [ ] Preview deployment created
- [ ] Preview URL commented on PR
- [ ] Manual testing on preview URL

#### For Production (Push to main):
- [ ] Changes pushed/merged to `main`
- [ ] GitHub Actions workflow starts
- [ ] Build completes
- [ ] Firestore rules deployed
- [ ] Production hosting deployed
- [ ] Deployment successful

---

## Post-Deployment Verification

### Basic Functionality Testing

Visit your deployed URL and verify:

#### Authentication
- [ ] Sign up page loads
- [ ] Can create new account
- [ ] Email validation works
- [ ] Login page loads
- [ ] Can sign in with existing account
- [ ] Can sign out
- [ ] Redirects work correctly

#### Dashboard
- [ ] Dashboard loads after login
- [ ] Summary cards display correctly
- [ ] Total spent shows correct amount
- [ ] Budget progress displays
- [ ] Categories count is correct
- [ ] Charts render properly

#### Transactions
- [ ] Can navigate to Transactions page
- [ ] Can create new transaction
- [ ] Transaction appears in list
- [ ] Can edit transaction
- [ ] Can delete transaction
- [ ] Search works
- [ ] Filters work (date range, category)
- [ ] Sort options work
- [ ] Export CSV works
- [ ] Export Excel works

#### Categories
- [ ] Can navigate to Categories page
- [ ] Can create new category
- [ ] Category appears in list
- [ ] Can edit category
- [ ] Can delete category (with confirmation)

#### Budgets
- [ ] Can navigate to Budgets page
- [ ] Can create new budget
- [ ] Budget appears in list
- [ ] Budget progress displays correctly
- [ ] Can edit budget
- [ ] Can delete budget

#### Recurring Transactions
- [ ] Can navigate to Recurring page
- [ ] Can create recurring template
- [ ] Template appears in list
- [ ] Can edit template
- [ ] Can toggle active/inactive
- [ ] "Create Now" button works
- [ ] "Process Due" button works
- [ ] Next due date is correct

#### Analytics
- [ ] Analytics page loads
- [ ] Date range selector works
- [ ] Overview tab displays
- [ ] Trends tab displays
- [ ] Forecast tab displays
- [ ] Budget analysis tab displays
- [ ] All charts render correctly
- [ ] Export PDF works

#### AI Features (if configured)
- [ ] AI Smart Input dialog opens
- [ ] Can parse natural language input
- [ ] Parsed data fills form correctly
- [ ] Receipt scanning dialog opens
- [ ] Can upload receipt image
- [ ] OCR extracts text
- [ ] AI parses transaction data

#### Internationalization
- [ ] Language selector works
- [ ] Switch to Chinese
- [ ] All text translated correctly
- [ ] Switch back to English
- [ ] Language persists on reload

#### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Navigation adapts to screen size
- [ ] Forms are usable on mobile
- [ ] Charts are readable on mobile

### Performance Testing

- [ ] Lighthouse score: Performance 90+
- [ ] Lighthouse score: Accessibility 90+
- [ ] Lighthouse score: Best Practices 90+
- [ ] Lighthouse score: SEO 90+
- [ ] Initial page load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] No layout shift (CLS < 0.1)

### Browser Compatibility

- [ ] Chrome (latest) - Desktop
- [ ] Chrome (latest) - Mobile
- [ ] Firefox (latest) - Desktop
- [ ] Safari (latest) - Desktop
- [ ] Safari - iOS
- [ ] Edge (latest) - Desktop

### Security Verification

- [ ] HTTPS enforced (no HTTP access)
- [ ] Firebase security rules active
- [ ] Users can only access own data
- [ ] Unauthenticated users redirected to login
- [ ] Protected routes work correctly
- [ ] No sensitive data in console logs
- [ ] No exposed API keys in source code

### Firebase Console Checks

Visit [Firebase Console](https://console.firebase.google.com/):

#### Hosting
- [ ] Deployment shows in history
- [ ] Correct files deployed
- [ ] Hosting URL matches expected
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

#### Firestore
- [ ] Database populated with test data
- [ ] Security rules deployed
- [ ] Indexes created (check for index warnings)
- [ ] Collections visible:
  - [ ] `transactions`
  - [ ] `categories`
  - [ ] `budgets`
  - [ ] `recurringTransactions`
  - [ ] `userSettings`

#### Authentication
- [ ] Email/Password provider enabled
- [ ] Test users can authenticate
- [ ] No authentication errors in logs

#### Analytics (Optional)
- [ ] Google Analytics tracking (if configured)
- [ ] User events being recorded

---

## Custom Domain Setup (Optional)

### DNS Configuration

- [ ] Domain purchased and accessible
- [ ] Added custom domain in Firebase Console
- [ ] DNS A records configured
- [ ] DNS TXT record added for verification
- [ ] DNS propagation complete (24-48 hours)
- [ ] Domain shows as "Connected" in Firebase

### SSL Certificate

- [ ] Certificate provisioning started
- [ ] Certificate provisioned successfully
- [ ] HTTPS works on custom domain
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal enabled

---

## Rollback Procedure (If Issues Found)

### If using Firebase Hosting:

1. List previous deployments:
   ```bash
   firebase hosting:channel:list
   ```

2. Rollback to previous version:
   ```bash
   firebase hosting:rollback
   ```

3. Verify rollback:
   - [ ] Visit hosting URL
   - [ ] Previous version is live
   - [ ] Functionality restored

### If using GitHub Actions:

1. Revert the commit:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. Wait for automatic deployment
   - [ ] GitHub Actions runs
   - [ ] Previous version deployed

---

## Troubleshooting Common Issues

### Build Fails

**Symptom**: `npm run build` fails with errors

**Actions**:
- [ ] Delete `node_modules` and `package-lock.json`
- [ ] Run `npm install`
- [ ] Run `npm run build` again
- [ ] Check for TypeScript errors
- [ ] Check for missing dependencies

### Deployment Permission Denied

**Symptom**: Firebase deploy fails with 403 error

**Actions**:
- [ ] Verify logged into correct account: `firebase login:list`
- [ ] Check project permissions in Firebase Console
- [ ] Re-authenticate: `firebase logout && firebase login`
- [ ] Verify correct project: `firebase use balanceapp-c4534`

### Application Loads But Shows Errors

**Symptom**: White screen or Firebase initialization errors

**Actions**:
- [ ] Open browser DevTools Console
- [ ] Check for specific error messages
- [ ] Verify environment variables in deployed app
- [ ] Check Firebase configuration
- [ ] Verify Firestore indexes
- [ ] Check security rules

### Authentication Not Working

**Symptom**: Cannot sign up or sign in

**Actions**:
- [ ] Verify Email/Password provider enabled in Firebase Console
- [ ] Check Firebase Auth domain matches deployed URL
- [ ] Check browser console for auth errors
- [ ] Verify security rules allow user creation

### Data Not Loading

**Symptom**: Dashboard empty, no transactions shown

**Actions**:
- [ ] Check Firestore security rules
- [ ] Verify user is authenticated
- [ ] Check browser console for Firestore errors
- [ ] Verify Firestore indexes are created
- [ ] Check network tab for failed requests

---

## Final Sign-Off

### Deployment Lead

- [ ] All checklist items completed
- [ ] No critical issues found
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation updated

**Deployed By**: _________________
**Date**: _________________
**Version/Commit**: _________________
**Live URL**: _________________

### Stakeholder Approval (if applicable)

- [ ] Product Owner approval
- [ ] Technical Lead approval
- [ ] Security review passed

**Approved By**: _________________
**Date**: _________________

---

## Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor Firebase Console for errors
- [ ] Check user signup/login success rate
- [ ] Monitor Firestore usage
- [ ] Check for performance degradation
- [ ] Monitor API quota usage (Anthropic)

### First Week

- [ ] Review user feedback
- [ ] Check error logs
- [ ] Monitor database growth
- [ ] Review performance metrics
- [ ] Plan hotfixes if needed

---

## Success! 🎉

Your BalanceApp is now deployed and accessible to users.

**Next Steps**:
- Share the URL with users
- Monitor for issues
- Gather feedback
- Plan next release
- Update roadmap

**Live Application**: https://balanceapp-c4534.web.app (or your custom domain)

---

**Deployment Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Overall Status**: _________________
