package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.entity.StateTransitionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StateTransitionLogRepository extends JpaRepository<StateTransitionLog, UUID> {
    List<StateTransitionLog> findByCommitIdOrderByCreatedAtAsc(UUID commitId);
}
