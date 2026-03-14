package com.st6.weeklycommit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reconciliation_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReconciliationEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "commit_entry_id", nullable = false)
    private UUID commitEntryId;

    @Column(columnDefinition = "TEXT")
    private String planned;

    @Column(columnDefinition = "TEXT")
    private String actual;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", nullable = false)
    private CompletionStatus completionStatus;

    @Column(name = "carry_forward")
    private Boolean carryForward;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (carryForward == null) carryForward = false;
    }

    public enum CompletionStatus {
        COMPLETED, PARTIAL, NOT_STARTED, DEPRIORITIZED
    }
}
