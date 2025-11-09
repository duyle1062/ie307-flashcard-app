# Flashcard App

A modern flashcard application with spaced repetition built using React Native (Expo) and Spring Boot.

## 🚀 Features

- 📱 **Cross-platform** mobile app (iOS & Android)
- 🔐 **Google OAuth** authentication
- 🎴 Create and manage **flashcard collections**
- 🧠 **Spaced repetition algorithm** (SM-2) for efficient learning
- 📊 **Progress tracking** and statistics
- 💾 **Offline-first** architecture with local SQLite storage
- ☁️ **Cloud sync** across devices (when online)
- 🔄 **Automatic sync queue** for offline changes

## 📁 Project Structure

```
ie307-flashcard-app/
├── frontend/          # React Native (Expo SDK 54) mobile app
└── backend/           # Spring Boot REST API
```

## 🛠️ Tech Stack

### Frontend

- **React Native** with Expo SDK 54
- **TypeScript** for type safety
- **Expo SQLite** for offline storage
- **React Navigation** for navigation
- **AsyncStorage** for local data persistence
- **Expo Auth Session** (Google OAuth)
- **Axios** for API calls
- **Spaced Repetition Algorithm** (SM-2)

### Backend

- **Spring Boot** 3.2.0
- **Spring Security** with JWT
- **Spring Data JPA**
- **PostgreSQL** (Neon cloud database)
- **Lombok** for boilerplate reduction
- **Maven** for dependency management
- **Google OAuth2** integration

## 📋 Prerequisites

- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- Git
- Google Cloud Console project (for OAuth) - optional for development

## � Quick Start (After Cloning)

### 1. Clone the Repository

```bash
git clone https://github.com/duyle1062/ie307-flashcard-app.git
cd ie307-flashcard-app
```

### 2. Install Backend Dependencies

```bash
cd backend
# Maven will automatically download dependencies when you run:
mvn clean install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

**Backend:**

```bash
cd backend
# Create .env file (or edit application.properties directly)
```

**Frontend:**

```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration (optional for development)
```

### 5. Start the Application

**Start Backend (Terminal 1):**

```bash
cd backend
mvn spring-boot:run
```

**Start Frontend (Terminal 2):**

```bash
cd frontend
npx expo start
```

The backend will run on `http://localhost:8080` and Expo will open Metro bundler.

---

## �🔧 Detailed Setup Instructions

### 1. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Web client** (for backend)
   - **iOS client** (for iOS app)
   - **Android client** (for Android app)
5. Add authorized redirect URIs:
   - For development: `http://localhost:8080/api/auth/google/callback`
   - For Expo: Add your Expo redirect URI

### 2. Backend Setup

```powershell
cd backend

# Copy and configure application.properties
# Edit src/main/resources/application.properties:
# - Set your Google OAuth client ID and secret
# - Configure JWT secret key
# - Set database configuration

# Run the application
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`

### 3. Frontend Setup

```powershell
cd frontend

# Copy environment variables
cp .env.example .env

# Edit .env file and add:
# - Google OAuth client IDs (web, iOS, Android)
# - Backend API URL
# - Expo project ID

# Install dependencies (already done)
# npm install

# Start the development server
npx expo start
```

### 4. Running the App

- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS only)
- Scan QR code with Expo Go app for physical device

## 🔑 Environment Variables

### Frontend (.env)

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your-web-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-android-client-id
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend (application.properties)

```properties
spring.security.oauth2.client.registration.google.client-id=your-google-client-id
spring.security.oauth2.client.registration.google.client-secret=your-google-client-secret
jwt.secret=your-jwt-secret-key-minimum-256-bits
```

## 📱 Development

### Frontend Development

```powershell
cd frontend
npx expo start --clear  # Clear cache and start
```

### Backend Development

```powershell
cd backend
mvn spring-boot:run
```

### Accessing H2 Console

Navigate to `http://localhost:8080/h2-console` with:

- JDBC URL: `jdbc:h2:mem:flashcarddb`
- Username: `sa`
- Password: (leave empty)

## 🏗️ Building for Production

### Frontend

```powershell
cd frontend
npx expo build:android  # For Android
npx expo build:ios      # For iOS (requires macOS)
```

### Backend

```powershell
cd backend
mvn clean package
java -jar target/flashcard-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/google` - Authenticate with Google OAuth
- `GET /api/auth/me` - Get current user (requires authentication)

### Deck Endpoints (Coming Soon)

- `GET /api/decks` - Get all user decks
- `POST /api/decks` - Create new deck
- `GET /api/decks/{id}` - Get deck details
- `PUT /api/decks/{id}` - Update deck
- `DELETE /api/decks/{id}` - Delete deck

### Card Endpoints (Coming Soon)

- `GET /api/decks/{deckId}/cards` - Get all cards in deck
- `POST /api/decks/{deckId}/cards` - Create new card
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card
- `POST /api/cards/{id}/review` - Submit review result

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Inspired by Anki
- Built with Expo and Spring Boot
