# Flashcard App - Backend

Spring Boot REST API for the Flashcard application.

## 🚀 Quick Start

```powershell
# Run the application
mvn spring-boot:run

# Or build and run
mvn clean package
java -jar target/flashcard-backend-0.0.1-SNAPSHOT.jar
```

The API will be available at `http://localhost:8080`

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL (for production)

## 🏗️ Project Structure

```
src/main/java/com/flashcard/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/             # Data Transfer Objects
├── model/           # JPA entities
├── repository/      # Spring Data repositories
├── security/        # Security configurations
└── service/         # Business logic
```

## 🔧 Configuration

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:h2:mem:flashcarddb
spring.datasource.username=sa
spring.datasource.password=

# Google OAuth
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET

# JWT
jwt.secret=YOUR_JWT_SECRET
jwt.expiration=86400000
```

## 🗄️ Database

### Development (H2)

- In-memory database
- Access H2 console at: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:flashcarddb`

### Production (PostgreSQL)

1. Create database: `createdb flashcarddb`
2. Update `application-prod.properties`
3. Run with profile: `--spring.profiles.active=prod`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user

### Decks (Protected)

- `GET /api/decks` - List all decks
- `POST /api/decks` - Create deck
- `GET /api/decks/{id}` - Get deck
- `PUT /api/decks/{id}` - Update deck
- `DELETE /api/decks/{id}` - Delete deck

### Cards (Protected)

- `GET /api/decks/{deckId}/cards` - List cards
- `POST /api/decks/{deckId}/cards` - Create card
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card
- `POST /api/cards/{id}/review` - Submit review

## 🔐 Security

- JWT-based authentication
- OAuth2 with Google
- Stateless session management
- CORS configured for mobile app

## 🧪 Testing

```powershell
mvn test
```

## 📦 Build

```powershell
# Package as JAR
mvn clean package

# Run the JAR
java -jar target/flashcard-backend-0.0.1-SNAPSHOT.jar
```

## 🐛 Debugging

Enable debug logging in `application.properties`:

```properties
logging.level.org.springframework.security=DEBUG
logging.level.com.flashcard=DEBUG
```

## 📄 License

MIT
