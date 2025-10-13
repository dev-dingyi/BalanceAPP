# Balance App - Personal Finance Tracker

A modern, privacy-focused personal finance tracking application with AI-powered features and dual-language support (English/Chinese).

## 🚀 Quick Start

**New to the project?** Start here:
1. **[INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)** - Step-by-step checklist
2. **[QUICKSTART.md](QUICKSTART.md)** - Fast setup guide (5-10 minutes)
3. **[SETUP.md](SETUP.md)** - Detailed instructions with explanations

## Features

### Tier 0 - Core Features (Currently Implemented)
- ✅ User authentication (sign up, sign in, sign out)
- ✅ Dual currency support (USD/CNY)
- ✅ Dual language support (English/中文)
- ✅ Responsive dashboard layout
- ✅ Protected routes and navigation
- ✅ Stealth mode toggle (UI ready)

### Tier 1 - Enhanced Features (In Progress)
- 🚧 Transaction management (add, edit, delete)
- 🚧 Unlimited custom categories
- 🚧 AI-assisted categorization
- 🚧 Custom budget cycles
- 🚧 Currency conversion

### Tier 2 - Advanced Features (Planned)
- ⏳ Natural language input ("Coffee 45 CNY at Starbucks")
- ⏳ Voice input
- ⏳ Image/receipt scanning with OCR
- ⏳ Flexible budgets (holidays, payday cycles)

### Tier 3 - Privacy Features (Planned)
- ⏳ Stealth mode implementation
  - Data scaling (reduce displayed amounts)
  - Hidden categories
  - Noise injection (fake transactions)
- ⏳ Machine learning for improved categorization

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Routing**: React Router v6
- **Internationalization**: i18next
- **Charts**: Recharts (to be implemented)

## Project Structure

```
web-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout with navigation
│   │   └── ProtectedRoute.tsx
│   ├── config/              # Configuration files
│   │   └── firebase.ts      # Firebase initialization
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts       # Authentication hook
│   ├── lib/                 # Libraries and utilities
│   │   └── i18n.ts          # i18n configuration
│   ├── locales/             # Translation files
│   │   ├── en.json          # English translations
│   │   └── zh.json          # Chinese translations
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── Onboarding.tsx
│   │   └── Dashboard.tsx
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts
│   │   └── settingsStore.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── .env.example             # Environment variables template
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BalanceAPP
   ```

2. Navigate to the web-app directory:
   ```bash
   cd web-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create a Firestore Database
   - Go to Project Settings > General
   - Copy your Firebase configuration

5. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

6. Add your Firebase credentials to `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

8. Open your browser and navigate to `http://localhost:5173`

### Firebase Firestore Rules (To be added)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /transactions/{transactionId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    match /categories/{categoryId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    match /budgets/{budgetId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Project setup with Vite + React + TypeScript
- [x] Firebase configuration
- [x] Authentication system
- [x] Routing and navigation
- [x] Dual-language support
- [x] Basic layout and dashboard

### Phase 2: Core Features (Next)
- [ ] Transaction CRUD operations
- [ ] Category management
- [ ] Dashboard data visualization
- [ ] Transaction list with filtering
- [ ] Budget management

### Phase 3: Enhanced Features
- [ ] AI category suggestions (OpenAI/Anthropic)
- [ ] Currency conversion API integration
- [ ] Smart input with natural language parsing
- [ ] Voice input
- [ ] Image/receipt OCR

### Phase 4: Privacy Features
- [ ] Stealth mode implementation
- [ ] Data transformation layer
- [ ] Stealth configuration UI

### Phase 5: Polish & Deployment
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states
- [ ] Firebase deployment
- [ ] User documentation

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License

## Contact

For questions or feedback, please open an issue in the repository.
