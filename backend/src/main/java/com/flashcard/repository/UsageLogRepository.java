package com.flashcard.repository;

import com.flashcard.model.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface UsageLogRepository extends JpaRepository<UsageLog, UUID> {
    
    List<UsageLog> findByUserId(UUID userId);
    
    List<UsageLog> findByUserIdAndAction(UUID userId, String action);
    
    @Query("SELECT HOUR(u.timestamp) as hour, COUNT(u) as count FROM UsageLog u WHERE u.user.id = :userId AND u.action = 'start_review' GROUP BY HOUR(u.timestamp) ORDER BY count DESC")
    List<Object[]> findMostActiveHourByUser(UUID userId);
}
