# BalanceApp Directory Structure

This document provides an overview of the BalanceApp project organization.

## Root Directory

\`\`\`
BalanceAPP/
├── .github/                    # GitHub-specific files
│   └── workflows/
│       └── firebase-deploy.yml # CI/CD automation workflow
│
├── docs/                       # Development documentation
│   ├── README.md              # Documentation index
│   ├── AI_CLAUDE_INTEGRATION.md
│   ├── AI_SMART_INPUT_FEATURE.md
│   ├── COMPLETE_FEATURE_SUMMARY.md
│   ├── NEXT_STEPS.md
│   ├── PHASE2_COMPLETE.md
│   ├── POLISH_CHANGELOG.md
│   ├── RECEIPT_SCANNING_OCR.md
│   ├── STEALTH_MODE_FIX.md
│   ├── TRANSACTION_EXPORT_FEATURE.md
│   ├── TRANSACTION_HISTORY_FEATURE.md
│   └── TROUBLESHOOTING.md
│
├── web-app/                    # Main React application
│   ├── src/                   # Source code (see below)
│   ├── public/                # Static assets
│   │   └── vite.svg
│   ├── dist/                  # Production build output (gitignored)
│   ├── node_modules/          # Dependencies (gitignored)
│   ├── .env                   # Local environment (gitignored)
│   ├── .env.example           # Environment template
│   ├── .env.production        # Production env template
│   ├── .gitignore             # Web-app gitignore
│   ├── eslint.config.js       # ESLint configuration
│   ├── index.html             # HTML entry point
│   ├── package.json           # Dependencies
│   ├── package-lock.json      # Locked dependencies
│   ├── README.md              # Web-app README
│   ├── tsconfig.json          # TypeScript config (root)
│   ├── tsconfig.app.json      # TypeScript config (app)
│   ├── tsconfig.node.json     # TypeScript config (node)
│   └── vite.config.ts         # Vite build configuration
│
├── .firebaserc                # Firebase project configuration
├── .gitignore                 # Root gitignore
├── deploy.sh                  # Deployment script (executable)
├── firebase.json              # Firebase hosting configuration
├── firestore.indexes.json     # Firestore index definitions
├── firestore.rules            # Firestore security rules
├── LICENSE                    # MIT License
├── package.json               # Root package (helper scripts)
│
├── DEPLOYMENT.md              # Deployment guide
├── DEPLOYMENT_CHECKLIST.md    # Deployment checklist
├── DIRECTORY_STRUCTURE.md     # This file
├── INSTALLATION_CHECKLIST.md  # Setup checklist
├── PROJECT_STATUS.md          # Project status overview
├── QUICKSTART.md              # Quick setup guide
├── README.md                  # Main project README
└── SETUP.md                   # Detailed setup guide
\`\`\`

## Web-App Source Code Structure

\`\`\`
web-app/src/
├── components/                # Reusable UI components
│   ├── analytics/             # Analytics-specific components
│   │   ├── BudgetVsActualChart.tsx
│   │   ├── CategoryTrendsChart.tsx
│   │   ├── MonthOverMonthComparison.tsx
│   │   └── SpendingForecast.tsx
│   ├── dashboard/             # Dashboard widgets
│   │   ├── AISmartInputDialog.tsx
│   │   ├── BudgetProgress.tsx
│   │   ├── QuickStats.tsx
│   │   ├── RecentTransactions.tsx
│   │   └── SpendingChart.tsx
│   ├── transaction/           # Transaction components
│   │   ├── ReceiptScanDialog.tsx
│   │   └── TransactionDialog.tsx
│   ├── Layout.tsx             # Main app layout with navigation
│   └── ProtectedRoute.tsx     # Route authentication wrapper
│
├── config/                    # Configuration files
│   └── firebase.ts            # Firebase initialization
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts             # Authentication hook
│   ├── useBudgets.ts          # Budget management
│   ├── useCategories.ts       # Category management
│   ├── useDashboardData.ts    # Dashboard data aggregation
│   ├── useRecurringTransactions.ts
│   ├── useStealthMode.ts      # Stealth mode logic
│   └── useTransactions.ts     # Transaction management
│
├── lib/                       # Libraries and utilities
│   └── i18n.ts                # i18next configuration
│
├── locales/                   # Translation files
│   ├── en.json                # English translations
│   └── zh.json                # Chinese translations
│
├── pages/                     # Page components (routes)
│   ├── Analytics.tsx          # Analytics dashboard
│   ├── Dashboard.tsx          # Main dashboard
│   ├── Login.tsx              # Login page
│   ├── Onboarding.tsx         # Onboarding flow
│   ├── RecurringTransactions.tsx
│   ├── SignUp.tsx             # Sign up page
│   └── Transactions.tsx       # Transaction history
│
├── stores/                    # Zustand state stores
│   ├── authStore.ts           # Authentication state
│   └── settingsStore.ts       # User settings state
│
├── types/                     # TypeScript type definitions
│   └── index.ts               # All type definitions
│
├── utils/                     # Utility functions
│   ├── aiParser.ts            # Claude AI integration
│   ├── currency.ts            # Currency formatting
│   ├── date.ts                # Date utilities
│   ├── export.ts              # CSV/Excel export
│   ├── firestore.ts           # Firestore service layer
│   ├── ocrService.ts          # OCR integration
│   ├── pdfExport.ts           # PDF generation
│   └── recurringUtils.ts      # Recurring transaction logic
│
├── App.css                    # Global app styles
├── App.tsx                    # Main app component with routing
├── index.css                  # Global CSS reset/base
└── main.tsx                   # React entry point
\`\`\`

## Key File Purposes

### Root Configuration Files

| File | Purpose |
|------|---------|
| \`.firebaserc\` | Links project to Firebase project ID |
| \`firebase.json\` | Firebase hosting, rewrites, headers |
| \`firestore.rules\` | Database security rules |
| \`firestore.indexes.json\` | Database query indexes |
| \`deploy.sh\` | Automated deployment script |
| \`package.json\` | Root helper scripts (dev, build, deploy) |

### Documentation Files

| File | Purpose |
|------|---------|
| \`README.md\` | Main project documentation |
| \`PROJECT_STATUS.md\` | Current status and roadmap |
| \`DEPLOYMENT.md\` | Deployment guide |
| \`DEPLOYMENT_CHECKLIST.md\` | Pre/post-deployment checklist |
| \`SETUP.md\` | Detailed setup instructions |
| \`QUICKSTART.md\` | Quick setup guide |
| \`INSTALLATION_CHECKLIST.md\` | Setup checklist |
| \`DIRECTORY_STRUCTURE.md\` | This file |
| \`LICENSE\` | MIT License |

### Application Entry Points

| File | Purpose |
|------|---------|
| \`web-app/index.html\` | HTML entry point |
| \`web-app/src/main.tsx\` | React entry point |
| \`web-app/src/App.tsx\` | Main app component with routing |

### Key Implementation Files

| File | Purpose |
|------|---------|
| \`web-app/src/config/firebase.ts\` | Firebase initialization |
| \`web-app/src/utils/firestore.ts\` | All Firestore operations |
| \`web-app/src/utils/aiParser.ts\` | Claude AI integration |
| \`web-app/src/utils/ocrService.ts\` | Tesseract OCR integration |
| \`web-app/src/lib/i18n.ts\` | Internationalization setup |

## Ignored Files and Directories

The following are ignored by Git (see \`.gitignore\`):

- \`node_modules/\` - Dependencies
- \`dist/\` - Build output
- \`.env\` - Local environment variables
- \`.env.local\` - Local environment overrides
- \`*.log\` - Log files
- \`.firebase/\` - Firebase cache

## Documentation Organization

Documentation is organized into two locations:

1. **Root Directory**: User-facing guides (setup, deployment, quickstart)
2. **docs/ Directory**: Development history, feature documentation, troubleshooting

This separation makes it easy for new users to find setup instructions while keeping detailed development history organized.

## Code Organization Principles

### Component Organization
- **Flat structure** for shared components
- **Feature-based folders** for complex features (analytics, dashboard, transaction)
- **Single responsibility** - each component does one thing well

### Hook Organization
- **One hook per feature** (useTransactions, useCategories, etc.)
- **Custom hooks** for complex logic reuse
- **Consistent naming** (use* prefix)

### Utility Organization
- **Grouped by function** (export, currency, date)
- **Service layer** pattern (firestore.ts abstracts database)
- **No circular dependencies**

### Type Organization
- **Centralized types** in types/index.ts
- **Shared interfaces** for common data structures
- **Type exports** for reuse across app

---

Last updated: October 13, 2025
