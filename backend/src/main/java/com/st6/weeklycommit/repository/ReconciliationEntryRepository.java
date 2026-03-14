package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.entity.ReconciliationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReconciliationEntryRepository extends JpaRepository<ReconciliationEntry, UUID> {
    List<ReconciliationEntry> findByCommitEntryIdIn(List<UUID> commitEntryIds);
}
