# Flashcard App - Frontend

React Native mobile application built with Expo SDK 54.

## 🚀 Quick Start

```powershell
# Install dependencies
npm install

# Start development server
npx expo start

# Run on platforms
# Press 'a' for Android
# Press 'i' for iOS
# Press 'w' for web (limited support)
```

## 📱 Features

- Google OAuth authentication
- Flashcard deck management
- Spaced repetition study system
- Progress tracking
- Offline support

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files
│   └── api.js       # Axios API client
├── contexts/        # React contexts
│   └── AuthContext.js
├── navigation/      # Navigation setup
│   └── AppNavigator.js
├── screens/         # Screen components
│   ├── LoginScreen.js
│   └── HomeScreen.js
└── services/        # API services
    └── authService.js
```

## 🔧 Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Google OAuth credentials
3. Update `EXPO_PUBLIC_API_URL` to point to your backend

## 📦 Dependencies

- `expo` - SDK 54
- `react-navigation` - Navigation library
- `expo-auth-session` - OAuth authentication
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Local storage

## 🧪 Testing

```powershell
npm test
```

## 🏗️ Building

```powershell
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🐛 Known Issues

- None yet

## 📄 License

MIT
