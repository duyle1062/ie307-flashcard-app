package com.flashcard.repository;

import com.flashcard.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface CardRepository extends JpaRepository<Card, UUID> {
    
    List<Card> findByCollectionId(UUID collectionId);
    
    List<Card> findByCollectionIdAndIsDeletedFalse(UUID collectionId);
    
    @Query("SELECT c FROM Card c WHERE c.collection.user.id = :userId AND c.dueDate <= :dueDate AND c.isDeleted = false ORDER BY c.dueDate ASC")
    List<Card> findDueCardsByUserId(UUID userId, LocalDate dueDate);
    
    @Query("SELECT c FROM Card c WHERE c.collection.id = :collectionId AND c.status = :status AND c.isDeleted = false")
    List<Card> findByCollectionIdAndStatus(UUID collectionId, String status);
}
