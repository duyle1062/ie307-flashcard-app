package com.flashcard.repository;

import com.flashcard.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    List<Review> findByCardId(UUID cardId);
    
    List<Review> findByUserId(UUID userId);
    
    @Query("SELECT r FROM Review r WHERE r.user.id = :userId AND DATE(r.reviewedAt) = :date")
    List<Review> findByUserIdAndDate(UUID userId, LocalDate date);
    
    // Count new cards studied today (old_interval = 0)
    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.id = :userId AND DATE(r.reviewedAt) = :date AND r.oldInterval = 0")
    Long countNewCardsStudiedToday(UUID userId, LocalDate date);
    
    // Count review cards studied today (old_interval > 0)
    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.id = :userId AND DATE(r.reviewedAt) = :date AND r.oldInterval > 0")
    Long countReviewCardsStudiedToday(UUID userId, LocalDate date);
}
