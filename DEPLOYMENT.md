# BalanceApp Deployment Guide

This guide covers deploying BalanceApp to Firebase Hosting with full CI/CD setup.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Manual Deployment](#manual-deployment)
4. [Automated Deployment (CI/CD)](#automated-deployment-cicd)
5. [Custom Domain & SSL](#custom-domain--ssl)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Firebase CLI Installation

Install Firebase CLI globally:

```bash
npm install -g firebase-tools
```

Verify installation:

```bash
firebase --version
```

### 2. Firebase Authentication

Login to Firebase:

```bash
firebase login
```

This will open a browser window for authentication.

### 3. Firebase Project Setup

The project is already configured with Firebase project `balanceapp-c4534`. Verify the connection:

```bash
firebase projects:list
```

You should see `balanceapp-c4534` in the list.

### 4. Node.js and npm

Ensure you have Node.js 18+ installed:

```bash
node --version  # Should be v18.0.0 or higher
npm --version
```

---

## Environment Setup

### 1. Production Environment Variables

Copy the production environment template:

```bash
cp web-app/.env.production web-app/.env.local
```

### 2. Configure Environment Variables

Edit `web-app/.env.local` with your actual values:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=balanceapp-c4534.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=balanceapp-c4534
VITE_FIREBASE_STORAGE_BUCKET=balanceapp-c4534.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id

# Anthropic API Key (for AI features)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Important Security Notes:**

- **Never commit `.env.local` to version control** (already in `.gitignore`)
- For production deployments, use Firebase environment configuration or GitHub Secrets
- The Anthropic API key enables AI-powered transaction parsing and receipt scanning

### 3. Get Your Firebase Configuration

If you need to retrieve your Firebase configuration:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`balanceapp-c4534`)
3. Click the gear icon (⚙️) → Project Settings
4. Scroll to "Your apps" section
5. Select your web app or create one if it doesn't exist
6. Copy the Firebase configuration values

### 4. Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key or use an existing one
5. Copy the API key (starts with `sk-ant-`)

---

## Manual Deployment

### Option 1: Using the Deployment Script (Recommended)

The project includes a deployment script that automates the entire process:

```bash
chmod +x deploy.sh  # Make script executable (already done)
./deploy.sh
```

The script will:
1. Check for Firebase CLI installation
2. Navigate to web-app directory
3. Install dependencies (`npm ci`)
4. Build the application (`npm run build`)
5. Deploy Firestore rules
6. Deploy to Firebase Hosting
7. Display the live URL

### Option 2: Manual Step-by-Step Deployment

#### Step 1: Install Dependencies

```bash
cd web-app
npm ci  # Clean install from package-lock.json
```

#### Step 2: Build the Application

```bash
npm run build
```

This creates an optimized production build in `web-app/dist/`.

**Expected output:**
- Bundle size: ~440 KB (143 KB gzipped)
- Multiple chunks for code splitting
- Optimized assets with cache headers

#### Step 3: Deploy Firestore Rules

```bash
cd ..  # Return to project root
firebase deploy --only firestore:rules
```

This deploys the security rules from `firestore.rules` to your Firestore database.

#### Step 4: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

This deploys the built application from `web-app/dist/` to Firebase Hosting.

#### Step 5: Get Your Live URL

After successful deployment, Firebase CLI will display:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/balanceapp-c4534/overview
Hosting URL: https://balanceapp-c4534.web.app
```

Visit your live application at the provided Hosting URL.

---

## Automated Deployment (CI/CD)

The project includes a GitHub Actions workflow for automated deployments.

### Setup GitHub Secrets

Configure the following secrets in your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `balanceapp-c4534.firebaseapp.com` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | `balanceapp-c4534` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `balanceapp-c4534.firebasestorage.app` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Sender ID | Firebase Messaging ID |
| `VITE_FIREBASE_APP_ID` | Your App ID | Firebase App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Your Measurement ID | Google Analytics ID |
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic API Key | Claude AI API Key |
| `FIREBASE_TOKEN` | Firebase CI Token | See below |

### Generate Firebase CI Token

Generate a Firebase CI token for GitHub Actions:

```bash
firebase login:ci
```

This will open a browser for authentication, then output a token. Copy this token and add it as the `FIREBASE_TOKEN` secret in GitHub.

### How CI/CD Works

The workflow (`.github/workflows/firebase-deploy.yml`) automatically:

**On Pull Requests:**
- Builds the application
- Creates a preview deployment
- Comments on the PR with the preview URL

**On Push to Main:**
- Builds the application
- Deploys Firestore rules
- Deploys to production Firebase Hosting
- Runs post-deployment verification

### Trigger a Deployment

**Automatic:**
- Push to `main` branch triggers production deployment
- Opening a PR triggers preview deployment

**Manual:**
You can also trigger deployments manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Firebase Hosting** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

---

## Custom Domain & SSL

### Step 1: Add Custom Domain

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`balanceapp-c4534`)
3. Navigate to **Hosting** → **Add custom domain**
4. Enter your domain (e.g., `balanceapp.com`)
5. Follow the verification steps

### Step 2: Configure DNS

Add the DNS records provided by Firebase to your domain registrar:

- **A Record**: Points to Firebase Hosting IP addresses
- **TXT Record**: Verifies domain ownership

### Step 3: SSL Certificate

Firebase automatically provisions and manages SSL certificates for custom domains:

- Certificate is issued within minutes to hours
- Auto-renews before expiration
- Enforces HTTPS (HTTP redirects to HTTPS)

### Step 4: Verify Setup

After DNS propagation (can take 24-48 hours):

```bash
firebase hosting:channel:list
```

Your custom domain should appear in the list.

---

## Post-Deployment Verification

### 1. Basic Functionality Checklist

Visit your deployed application and verify:

- [ ] Application loads without errors
- [ ] Authentication works (Sign Up / Sign In)
- [ ] Dashboard displays correctly
- [ ] Can create transactions
- [ ] Can create categories
- [ ] Can create budgets
- [ ] Can create recurring transactions
- [ ] Analytics page loads and displays charts
- [ ] Export features work (CSV, Excel, PDF)
- [ ] AI smart input parses transactions (if API key configured)
- [ ] Receipt scanning works (OCR)
- [ ] Language switching (English/Chinese) works
- [ ] All navigation links work

### 2. Performance Verification

Check performance metrics:

```bash
# Lighthouse CI (optional)
npm install -g @lhci/cli
lhci autorun --collect.url=https://your-app-url.web.app
```

**Expected Lighthouse Scores:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### 3. Browser Testing

Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 4. Check Firebase Console

Verify in [Firebase Console](https://console.firebase.google.com/):

1. **Hosting**: Deployment history and URLs
2. **Firestore**: Database is accessible and rules are applied
3. **Authentication**: Sign-in methods are enabled
4. **Analytics** (optional): User activity tracking

---

## Troubleshooting

### Build Fails

**Error:** `Module not found` or dependency errors

**Solution:**
```bash
cd web-app
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### Firebase CLI Authentication Error

**Error:** `Error: Authentication Error`

**Solution:**
```bash
firebase logout
firebase login
```

---

### Deployment Fails: Permission Denied

**Error:** `HTTP Error: 403, Permission denied`

**Solution:**
1. Verify you're logged into the correct Google account
2. Check Firebase project permissions in console
3. Ensure you have "Editor" or "Owner" role

---

### Environment Variables Not Loading

**Error:** API features not working, Firebase initialization fails

**Solution:**
1. Verify `.env.local` exists in `web-app/` directory
2. Check that all variables start with `VITE_`
3. Restart development server after changing env vars
4. For production, ensure GitHub Secrets are configured correctly

---

### Firestore Rules Deployment Fails

**Error:** `Invalid rule` or syntax errors

**Solution:**
1. Test rules locally: `firebase emulators:start --only firestore`
2. Check `firestore.rules` syntax
3. Common issues:
   - Missing semicolons
   - Unclosed brackets
   - Invalid function names

---

### GitHub Actions Deployment Fails

**Error:** Workflow fails with authentication or build errors

**Solution:**
1. Verify all GitHub Secrets are set correctly
2. Check `FIREBASE_TOKEN` is valid: `firebase login:ci`
3. Review workflow logs in GitHub Actions tab
4. Ensure `package-lock.json` is committed

---

### Application Loads But Shows Errors

**Error:** Firebase initialization errors, API errors

**Solution:**
1. Open browser DevTools (F12) → Console
2. Check for specific error messages
3. Common causes:
   - Incorrect Firebase config
   - Missing Firestore indexes (check console for index URLs)
   - API keys not configured
   - CORS issues with APIs

---

### Custom Domain SSL Certificate Not Provisioning

**Error:** Domain shows "Not Secure" or certificate errors

**Solution:**
1. Verify DNS records are correct (wait 24-48 hours for propagation)
2. Check Firebase Console → Hosting → Domain status
3. Ensure CAA records allow certificate issuance
4. Contact Firebase support if stuck in "Provisioning" state

---

### Performance Issues / Large Bundle Size

**Error:** Slow load times, large JavaScript files

**Solution:**
1. Analyze bundle: `npm run build -- --mode production`
2. The app uses code splitting - verify chunks are loading correctly
3. Enable Firebase Hosting caching (already configured in `firebase.json`)
4. Consider lazy loading additional routes if needed

---

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Production Build Guide](https://vitejs.dev/guide/build.html)
- [Anthropic API Documentation](https://docs.anthropic.com/)

---

## Support

For issues specific to:
- **Firebase**: Check [Firebase Support](https://firebase.google.com/support)
- **GitHub Actions**: Review workflow logs and [GitHub Actions docs](https://docs.github.com/en/actions)
- **Application bugs**: Check browser console and Firestore logs

---

## Deployment Checklist

Use this checklist before each deployment:

- [ ] All tests pass locally
- [ ] Build succeeds without errors
- [ ] Environment variables are configured
- [ ] Firestore rules are updated (if schema changed)
- [ ] Firebase indexes are created (if new queries added)
- [ ] Version number updated (optional)
- [ ] CHANGELOG updated (optional)
- [ ] GitHub secrets are current
- [ ] Custom domain DNS is configured (if applicable)
- [ ] Post-deployment testing completed

---

**Deployment Complete!** Your BalanceApp is now live and accessible to users worldwide.
