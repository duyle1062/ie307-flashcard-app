package com.flashcard.service;

import com.flashcard.dto.AuthResponse;
import com.flashcard.dto.GoogleAuthRequest;
import com.flashcard.dto.UserDTO;
import com.flashcard.model.User;
import com.flashcard.repository.UserRepository;
import com.flashcard.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        try {
            // Exchange authorization code for tokens
            GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    new GsonFactory(),
                    "https://oauth2.googleapis.com/token",
                    googleClientId,
                    googleClientSecret,
                    request.getCode(),
                    request.getRedirectUri()
            ).execute();

            // Verify and decode the ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(tokenResponse.getIdToken());
            if (idToken == null) {
                throw new RuntimeException("Invalid ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            // Find or create user
            User user = userRepository.findByGoogleId(googleId)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .googleId(googleId)
                                .email(email)
                                .name(name)
                                .picture(picture)
                                .provider(User.AuthProvider.GOOGLE)
                                .build();
                        return userRepository.save(newUser);
                    });

            // Update user info if changed
            if (!user.getName().equals(name) || !user.getPicture().equals(picture)) {
                user.setName(name);
                user.setPicture(picture);
                userRepository.save(user);
            }

            // Generate JWT
            String jwt = jwtUtil.generateToken(user.getEmail());

            UserDTO userDTO = UserDTO.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .picture(user.getPicture())
                    .build();

            return AuthResponse.builder()
                    .token(jwt)
                    .user(userDTO)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage(), e);
        }
    }
}
