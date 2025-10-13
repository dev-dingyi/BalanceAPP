# Balance App - Setup Guide

This guide will help you set up the Balance App for development.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A **Google account** (for Firebase)

## Step 1: Install Firebase CLI

The Firebase CLI is needed for deploying and managing your Firebase project.

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

## Step 2: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter a project name (e.g., "balance-app")
4. Disable Google Analytics (optional, you can enable it later)
5. Click **"Create project"**

## Step 3: Enable Firebase Services

### Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Click **"Save"**

### Create Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add security rules later)
4. Choose a Cloud Firestore location (select one closest to you)
5. Click **"Enable"**

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **"Web" icon** (</>)
5. Register your app with a nickname (e.g., "Balance Web App")
6. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

1. Navigate to the web-app directory:
   ```bash
   cd web-app
   ```

2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and paste your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   **Example:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyD...
   VITE_FIREBASE_AUTH_DOMAIN=balance-app-12345.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=balance-app-12345
   VITE_FIREBASE_STORAGE_BUCKET=balance-app-12345.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
   ```

## Step 6: Initialize Firebase in Your Project

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase in the project root:
   ```bash
   cd /Users/dingyi/Projects/BalanceAPP
   firebase init
   ```

3. Select the following options:
   - **Services to set up:**
     - ☑ Firestore: Configure security rules and indexes files for Firestore
     - ☑ Hosting: Configure files for Firebase Hosting
   - **Use an existing project:** Select your project from the list
   - **Firestore rules file:** Press Enter (use default: `firestore.rules`)
   - **Firestore indexes file:** Press Enter (use default: `firestore.indexes.json`)
   - **Public directory:** Enter `web-app/dist`
   - **Configure as a single-page app:** Yes
   - **Set up automatic builds:** No
   - **Overwrite files:** No

## Step 7: Update Firestore Security Rules

After initialization, update the `firestore.rules` file in the project root:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // User settings
    match /userSettings/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Transactions
    match /transactions/{transactionId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    // Categories
    match /categories/{categoryId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    // Budgets
    match /budgets/{budgetId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
  }
}
```

Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

## Step 8: Install Dependencies and Start Development

1. Navigate to the web-app directory:
   ```bash
   cd web-app
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to: `http://localhost:5173`

## Verification Checklist

- [ ] Firebase CLI installed and logged in
- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] `.env` file created with Firebase credentials
- [ ] Firebase initialized in project
- [ ] Firestore rules deployed
- [ ] Development server running successfully
- [ ] Can sign up and log in to the app

## Common Issues

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution:** Make sure your `.env` file is in the `web-app` directory and contains all required Firebase credentials.

### Issue: "Permission denied" errors in Firestore
**Solution:** Deploy your Firestore rules using `firebase deploy --only firestore:rules`

### Issue: Development server won't start
**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Try `npm run dev` again

## Next Steps

Once everything is set up and running:

1. **Test the authentication**: Sign up with a test email
2. **Explore the dashboard**: Navigate through the empty dashboard
3. **Ready for Phase 2**: We can now implement transaction management and categories

## Optional: Install Recommended VS Code Extensions

If you're using Visual Studio Code, install these extensions for a better development experience:

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **ES7+ React/Redux/React-Native snippets** - React snippets
- **Firebase** - Firebase integration
- **i18n Ally** - Translation management

## Need Help?

If you encounter any issues during setup, please check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
