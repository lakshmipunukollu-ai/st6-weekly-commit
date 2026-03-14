package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.entity.Commit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface CommitRepository extends JpaRepository<Commit, UUID> {
    List<Commit> findByUserIdAndWeekStart(UUID userId, LocalDate weekStart);
    List<Commit> findByUserId(UUID userId);

    @Query("SELECT c FROM Commit c WHERE c.userId IN :userIds AND c.weekStart = :weekStart")
    List<Commit> findByUserIdInAndWeekStart(@Param("userIds") List<UUID> userIds, @Param("weekStart") LocalDate weekStart);

    @Query("SELECT c FROM Commit c WHERE c.userId IN :userIds")
    List<Commit> findByUserIdIn(@Param("userIds") List<UUID> userIds);
}
