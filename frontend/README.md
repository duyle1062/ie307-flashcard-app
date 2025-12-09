# Flashcard App - Frontend

React Native mobile application built with Expo SDK 54 with SQLite local database and Firebase backend.

## 🚀 Quick Start

```powershell
# Install dependencies
npm install

# Setup Firebase (IMPORTANT!)
# See QUICKSTART.md for 3-minute setup guide

# Start development server
npx expo start

# Run on platforms
# Press 'a' for Android
# Press 'i' for iOS
# Press 'w' for web (limited support)
```

## 📚 Documentation

**Start here:**
- 📖 [QUICKSTART.md](./QUICKSTART.md) - 3-minute Firebase setup
- ✅ [CHECKLIST.md](./CHECKLIST.md) - Verify your implementation

**Deep dive:**
- 🔥 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed Firebase configuration
- 🏗️ [AUTH_FLOW.md](./AUTH_FLOW.md) - Authentication architecture
- 📋 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's implemented

## 📱 Features

### ✅ Implemented
- ✅ Email/Password authentication (Firebase)
- ✅ User registration & login
- ✅ Persistent sessions (auto-login)
- ✅ SQLite local database (offline-first)
- ✅ User data sync (Firebase ↔ SQLite)
- ✅ Flashcard deck management
- ✅ Spaced repetition study system
- ✅ Progress tracking

### 🔜 Coming Soon
- 🔜 Google OAuth
- 🔜 Facebook OAuth
- 🔜 Password reset
- 🔜 Email verification
- 🔜 Profile picture upload

## 🏗️ Project Structure

```
src/
├── config/
│   └── firebaseConfig.ts    # Firebase initialization
├── context/
│   └── AuthContext.tsx       # Authentication state
├── database/
│   ├── database.tsx          # SQLite setup
│   ├── repositories/         # Database queries
│   │   ├── UserRepository.tsx
│   │   ├── CollectionRepository.tsx
│   │   ├── CardRepository.tsx
│   │   └── ReviewRepository.tsx
│   └── storage.tsx           # AsyncStorage helpers
├── navigation/
│   ├── RootNavigator.tsx     # Auth routing
│   ├── AuthStack.tsx         # Login/Register screens
│   └── AppStack.tsx          # Main app screens
├── pages/
│   ├── Login.tsx             # Login screen
│   ├── Register.tsx          # Registration screen
│   ├── Home.tsx              # Home screen
│   └── Study.tsx             # Study screen
└── components/
    ├── AuthButton.tsx        # Authentication button
    ├── AuthInput.tsx         # Input with validation
    └── AuthSocial.tsx        # OAuth buttons (prepared)
```

## 🔧 Configuration

### 1. Firebase Setup

Follow [QUICKSTART.md](./QUICKSTART.md) for 3-minute setup:

1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Copy config to `.env`

### 2. Environment Variables

```bash
cp .env.example .env
```

Then fill in your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

## 📦 Dependencies

**Core:**
- `expo` - SDK 54
- `react-navigation` - Navigation library
- `firebase` - Backend & authentication
- `@react-native-async-storage/async-storage` - Local storage
- `expo-sqlite` - Local database

**Authentication:**
- Firebase Authentication (Email/Password)
- Future: Google OAuth, Facebook OAuth

**Database:**
- SQLite (local, offline-first)
- Firestore (cloud, sync)

## 🔐 Authentication Flow

```
User Register/Login
        ↓
Firebase Authentication
        ↓
Create/Fetch user from Firestore
        ↓
Sync to SQLite local database
        ↓
Save session to AsyncStorage
        ↓
Navigate to App
```

See [AUTH_FLOW.md](./AUTH_FLOW.md) for detailed architecture.

## 🧪 Testing

**Manual Testing:**
1. Register new account
2. Check Firebase Console > Authentication
3. Check Firestore Database > users collection
4. Login with registered account
5. Close and reopen app (auto-login test)
6. Logout test

See [CHECKLIST.md](./CHECKLIST.md) for full testing checklist.

## 🏗️ Building

```powershell
# Development build
npx expo start

# Production build (requires EAS)
npx eas build --platform android
npx eas build --platform ios
```

## 🆘 Troubleshooting

**App won't start:**
```bash
rm -rf node_modules
npm install
npx expo start -c
```

**Firebase errors:**
- Check `.env` file exists and has correct values
- Verify Firebase project is active
- Check Authentication is enabled in Firebase Console

**SQLite errors:**
- Check `expo-sqlite` plugin in `app.json`
- Try clearing app data

**Common Issues:**
- "Email already in use" → Use different email
- "Weak password" → Use 8+ characters
- Auto-login not working → Check AsyncStorage permissions

See [CHECKLIST.md](./CHECKLIST.md) for detailed verification.

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Required variables:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## 🔒 Security

- ✅ Firebase credentials in `.env` (not committed)
- ✅ Firestore Security Rules restrict data access
- ✅ Password minimum 8 characters
- ✅ Email validation
- ✅ Secure password hashing (Firebase handled)

## 🚀 Next Steps

1. ✅ Complete Firebase setup ([QUICKSTART.md](./QUICKSTART.md))
2. ✅ Test authentication flow ([CHECKLIST.md](./CHECKLIST.md))
3. 🔜 Implement Google OAuth
4. 🔜 Add password reset feature
5. 🔜 Add email verification
6. 🔜 Implement card sync with Firestore

## 🐛 Known Issues

- OAuth buttons are placeholders (show "Coming Soon" alert)
- Password reset not yet implemented
- Email verification not yet implemented

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT
