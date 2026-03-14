package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.entity.CommitEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CommitEntryRepository extends JpaRepository<CommitEntry, UUID> {
    List<CommitEntry> findByCommitIdOrderByPriorityAsc(UUID commitId);
}
