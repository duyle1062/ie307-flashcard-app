package com.flashcard.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "UUID")
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    @Column(name = "google_id", unique = true)
    private String googleId;
    
    private String picture;
    
    // For compatibility with AuthService (even though not stored in DB)
    @Transient
    private AuthProvider provider;
    
    @Column(name = "streak_days")
    @Builder.Default
    private Integer streakDays = 0;
    
    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;
    
    @Column(name = "daily_new_cards_limit")
    @Builder.Default
    private Integer dailyNewCardsLimit = 25;
    
    @Column(name = "daily_review_cards_limit")
    @Builder.Default
    private Integer dailyReviewCardsLimit = 50;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Collection> collections = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum AuthProvider {
        GOOGLE, LOCAL
    }
}
