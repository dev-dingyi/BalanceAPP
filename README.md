# BalanceApp - Personal Finance Tracker

A modern, privacy-focused personal finance tracking application with AI-powered features and dual-language support (English/Chinese).

## 🚀 Quick Start

**New to the project?** Choose your path:
1. **[INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)** - Step-by-step setup checklist
2. **[QUICKSTART.md](QUICKSTART.md)** - Fast setup guide (5-10 minutes)
3. **[SETUP.md](SETUP.md)** - Detailed instructions with explanations
4. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

## ✨ Features

### Core Features
- ✅ **User Authentication** - Secure sign up/sign in with Firebase Auth
- ✅ **Transaction Management** - Add, edit, delete, and search transactions
- ✅ **Custom Categories** - Unlimited categories with icons and colors
- ✅ **Budget Management** - Monthly and custom period budgets with progress tracking
- ✅ **Dual Currency** - Support for USD and CNY with currency conversion
- ✅ **Dual Language** - Full English and Chinese (中文) support
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### AI-Powered Features
- ✅ **AI Smart Input** - Natural language transaction parsing powered by Claude AI
  - Example: "Coffee 45 CNY at Starbucks" → Automatically creates transaction
- ✅ **Receipt Scanning** - OCR-powered receipt scanning with AI extraction
  - Upload or photograph receipts
  - Automatic merchant, amount, and date detection
  - Smart category suggestions

### Analytics & Insights
- ✅ **Enhanced Analytics Dashboard**
  - Month-over-month spending comparison
  - Category trends over time
  - Spending forecasts using linear regression
  - Budget vs actual analysis
- ✅ **Export Capabilities**
  - CSV export for transactions and analytics
  - Excel export with formatting
  - PDF reports with charts and tables
- ✅ **Interactive Charts** - Powered by Recharts
  - Spending by category (pie charts)
  - Spending trends over time (line charts)
  - Budget progress visualization

### Advanced Features
- ✅ **Recurring Transactions** - Automated recurring expense tracking
  - Daily, weekly, biweekly, monthly, quarterly, yearly frequencies
  - Template-based system
  - Automatic transaction creation
  - Manual "create now" and "process due" options
- ✅ **Transaction History** - Comprehensive transaction management
  - Advanced filtering and search
  - Date range selection
  - Category filtering
  - Multiple sort options
- ✅ **Dashboard Widgets**
  - Total spending this month
  - Budget progress with color-coded alerts
  - Active categories count
  - Recent transactions
  - Spending trends

### Privacy Features
- ✅ **Stealth Mode** - Privacy protection (UI ready, full implementation pending)
  - Data scaling (reduce displayed amounts)
  - Hidden categories
  - Noise injection (fake transactions)
- ✅ **Secure by Default** - Firestore security rules enforce data isolation

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Material-UI (MUI)** - Comprehensive UI component library
- **React Router v6** - Client-side routing
- **i18next** - Internationalization framework

### Backend & Services
- **Firebase Authentication** - Secure user authentication
- **Firebase Firestore** - NoSQL cloud database
- **Firebase Hosting** - Fast and secure web hosting
- **Anthropic Claude API** - AI-powered natural language processing
- **Tesseract.js** - Client-side OCR for receipt scanning

### Data Visualization & Export
- **Recharts** - Composable charting library
- **jsPDF** - PDF generation
- **jspdf-autotable** - PDF table generation

### State Management & Utilities
- **Zustand** - Lightweight state management
- **date-fns** - Modern date utility library

### Development & Deployment
- **ESLint** - Code quality and consistency
- **GitHub Actions** - CI/CD automation
- **Firebase CLI** - Deployment and management tools

## 📁 Project Structure

```
BalanceAPP/
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml    # CI/CD pipeline
├── web-app/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── analytics/         # Analytics-specific components
│   │   │   ├── dashboard/         # Dashboard widgets
│   │   │   ├── transaction/       # Transaction components
│   │   │   ├── Layout.tsx         # Main app layout
│   │   │   └── ProtectedRoute.tsx # Route authentication wrapper
│   │   ├── config/
│   │   │   └── firebase.ts        # Firebase initialization
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.ts         # Authentication
│   │   │   ├── useTransactions.ts # Transaction management
│   │   │   ├── useCategories.ts   # Category management
│   │   │   ├── useBudgets.ts      # Budget management
│   │   │   ├── useRecurringTransactions.ts
│   │   │   ├── useDashboardData.ts
│   │   │   └── useStealthMode.ts
│   │   ├── lib/
│   │   │   └── i18n.ts            # i18n configuration
│   │   ├── locales/
│   │   │   ├── en.json            # English translations
│   │   │   └── zh.json            # Chinese translations
│   │   ├── pages/                 # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── RecurringTransactions.tsx
│   │   ├── stores/                # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── settingsStore.ts
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript definitions
│   │   ├── utils/                 # Utility functions
│   │   │   ├── firestore.ts       # Firestore service layer
│   │   │   ├── currency.ts        # Currency formatting
│   │   │   ├── date.ts            # Date utilities
│   │   │   ├── export.ts          # CSV/Excel export
│   │   │   ├── pdfExport.ts       # PDF export
│   │   │   ├── aiParser.ts        # Claude AI integration
│   │   │   ├── ocrService.ts      # OCR integration
│   │   │   └── recurringUtils.ts  # Recurring transaction logic
│   │   ├── App.tsx                # Main app component with routing
│   │   └── main.tsx               # Entry point
│   ├── .env.example               # Environment variables template
│   ├── .env.production            # Production env template
│   ├── package.json
│   └── vite.config.ts             # Vite configuration
├── .firebaserc                    # Firebase project configuration
├── firebase.json                  # Firebase hosting configuration
├── firestore.rules                # Firestore security rules
├── firestore.indexes.json         # Firestore indexes
├── deploy.sh                      # Deployment script
├── DEPLOYMENT.md                  # Deployment guide
├── INSTALLATION_CHECKLIST.md      # Setup checklist
├── QUICKSTART.md                  # Quick setup guide
├── SETUP.md                       # Detailed setup guide
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Firebase account** (free tier works)
- **Anthropic API key** (optional, for AI features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd BalanceAPP
   ```

2. **Navigate to web-app directory**:
   ```bash
   cd web-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up Firebase**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable **Authentication** → Email/Password
   - Create a **Firestore Database** in production mode
   - Copy your Firebase configuration

5. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Optional: For AI features
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

6. **Deploy Firestore rules**:
   ```bash
   cd ..  # Back to project root
   firebase deploy --only firestore:rules
   ```

7. **Start development server**:
   ```bash
   cd web-app
   npm run dev
   ```

8. **Open your browser**:
   Navigate to `http://localhost:5173`

For detailed setup instructions, see [SETUP.md](SETUP.md).

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:5173)

# Building
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking (if configured)

# Deployment (from project root)
./deploy.sh          # Full deployment (build + Firestore rules + hosting)
firebase deploy --only hosting        # Deploy hosting only
firebase deploy --only firestore      # Deploy Firestore rules only
```

## 🌐 Deployment

### Quick Deployment

```bash
# From project root
./deploy.sh
```

### CI/CD with GitHub Actions

The project includes automated deployment via GitHub Actions:

1. **Set up GitHub Secrets** with your Firebase and Anthropic credentials
2. **Push to main branch** → Automatic production deployment
3. **Open a PR** → Automatic preview deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

## 🔐 Security & Privacy

### Firestore Security Rules

The app uses comprehensive Firestore security rules to ensure:
- Users can only access their own data
- All operations are authenticated
- Data validation on writes
- Protection against malicious queries

### Data Privacy

- **Client-side only**: OCR processing happens in your browser
- **No data sharing**: Your financial data never leaves Firebase (except AI API calls)
- **Secure authentication**: Firebase Auth with email/password
- **HTTPS enforced**: All connections are encrypted
- **Stealth mode**: Optional privacy layer for display (coming soon)

## 📊 Key Features Explained

### AI Smart Input

Type naturally and let Claude AI parse your transaction:

```
Input:  "Coffee 45 CNY at Starbucks"
Output: {
  description: "Coffee at Starbucks",
  amount: 45,
  currency: "CNY",
  location: "Starbucks",
  category: "Food & Dining"
}
```

### Receipt Scanning

1. Take a photo or upload a receipt
2. OCR extracts text from the image
3. AI parses merchant, amount, date
4. Auto-suggests appropriate category
5. Review and confirm transaction

### Recurring Transactions

Set up templates for:
- Monthly subscriptions (Netflix, Spotify, etc.)
- Weekly expenses (groceries, gas, etc.)
- Quarterly bills (insurance, taxes, etc.)
- Yearly payments (memberships, renewals, etc.)

The app automatically creates transactions based on your schedule.

### Enhanced Analytics

- **Month-over-Month**: See spending trends with percentage changes
- **Category Trends**: Multi-line charts showing how category spending evolves
- **Forecasting**: Predict future spending based on historical patterns
- **Budget Analysis**: Compare actual vs budgeted spending with detailed breakdowns
- **Export**: Download reports as CSV, Excel, or PDF

## 🗺️ Development Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Project setup with Vite + React + TypeScript
- [x] Firebase configuration
- [x] Authentication system
- [x] Routing and navigation
- [x] Dual-language support (English/Chinese)
- [x] Basic layout and dashboard

### ✅ Phase 2: Core Features (Completed)
- [x] Transaction CRUD operations
- [x] Category management
- [x] Dashboard data visualization
- [x] Transaction list with filtering
- [x] Budget management
- [x] Search and sort functionality

### ✅ Phase 3: Enhanced Features (Completed)
- [x] AI-powered natural language input (Claude AI)
- [x] Receipt scanning with OCR (Tesseract.js)
- [x] Enhanced analytics with charts and forecasting
- [x] Export to CSV, Excel, and PDF
- [x] Recurring transactions
- [x] Transaction history enhancements

### ✅ Phase 4: Deployment (Completed)
- [x] Firebase Hosting setup
- [x] Firestore security rules
- [x] Environment configuration
- [x] Build optimization
- [x] CI/CD with GitHub Actions
- [x] Deployment documentation

### 🚧 Phase 5: Mobile & PWA (Next)
- [ ] Progressive Web App (PWA) configuration
- [ ] Offline support with service workers
- [ ] Mobile-optimized layouts
- [ ] Touch gestures and mobile UX
- [ ] Add to home screen functionality
- [ ] Push notifications (optional)

### 🚧 Phase 6: Notifications & Reminders (Next)
- [ ] Budget alert system
- [ ] Recurring transaction reminders
- [ ] Custom spending alerts
- [ ] Email notifications
- [ ] In-app notification center

### 🚧 Phase 7: Testing & Quality (Next)
- [ ] Unit tests with Vitest
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Performance monitoring
- [ ] Error tracking and logging
- [ ] Accessibility improvements

### 🔮 Phase 8: Future Enhancements
- [ ] Full stealth mode implementation
- [ ] Multi-currency advanced features
- [ ] Shared budgets and categories
- [ ] Data import/export from other apps
- [ ] Machine learning for categorization
- [ ] Voice input for transactions
- [ ] Custom dashboard widgets
- [ ] Dark mode theme

## 🤝 Contributing

This is currently a personal project, but suggestions and feedback are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests
- Share ideas and improvements

## 📄 License

MIT License - See LICENSE file for details

## 📞 Contact & Support

For questions, feedback, or issues:
- Open an issue in the repository
- Check [SETUP.md](SETUP.md) for common setup issues
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment troubleshooting

## 🙏 Acknowledgments

- **Anthropic Claude** - AI-powered natural language processing
- **Firebase** - Backend infrastructure and hosting
- **Material-UI** - Beautiful React components
- **Recharts** - Elegant data visualization
- **Tesseract.js** - Client-side OCR capabilities

---

**Made with ❤️ for better personal finance management**
