package com.st6.weeklycommit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "commits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Commit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommitState state;

    @Column(name = "rally_cry_id")
    private UUID rallyCryId;

    @Column(name = "defining_objective_id")
    private UUID definingObjectiveId;

    @Column(name = "outcome_id")
    private UUID outcomeId;

    @Column(name = "original_commit_id")
    private UUID originalCommitId;

    @OneToMany(mappedBy = "commit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("priority ASC")
    @Builder.Default
    private List<CommitEntry> entries = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (state == null) state = CommitState.DRAFT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CommitState {
        DRAFT, LOCKED, RECONCILING, RECONCILED, CARRIED_FORWARD
    }
}
