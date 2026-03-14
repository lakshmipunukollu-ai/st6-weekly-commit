package com.st6.weeklycommit.service;

import com.st6.weeklycommit.dto.CommitEntryRequest;
import com.st6.weeklycommit.dto.CommitRequest;
import com.st6.weeklycommit.dto.ReconciliationRequest;
import com.st6.weeklycommit.dto.ReorderRequest;
import com.st6.weeklycommit.entity.*;
import com.st6.weeklycommit.entity.Commit.CommitState;
import com.st6.weeklycommit.exception.InvalidTransitionException;
import com.st6.weeklycommit.exception.ResourceNotFoundException;
import com.st6.weeklycommit.repository.*;
import com.st6.weeklycommit.statemachine.CommitStateMachine;
import com.st6.weeklycommit.statemachine.CommitStateMachine.CommitEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommitService {

    private final CommitRepository commitRepository;
    private final CommitEntryRepository entryRepository;
    private final ReconciliationEntryRepository reconciliationRepository;
    private final StateTransitionLogRepository transitionLogRepository;
    private final UserRepository userRepository;
    private final CommitStateMachine stateMachine;

    public CommitService(CommitRepository commitRepository,
                         CommitEntryRepository entryRepository,
                         ReconciliationEntryRepository reconciliationRepository,
                         StateTransitionLogRepository transitionLogRepository,
                         UserRepository userRepository,
                         CommitStateMachine stateMachine) {
        this.commitRepository = commitRepository;
        this.entryRepository = entryRepository;
        this.reconciliationRepository = reconciliationRepository;
        this.transitionLogRepository = transitionLogRepository;
        this.userRepository = userRepository;
        this.stateMachine = stateMachine;
    }

    public Commit createCommit(UUID userId, CommitRequest request) {
        LocalDate weekStart = LocalDate.parse(request.getWeekStart());
        Commit commit = Commit.builder()
                .userId(userId)
                .weekStart(weekStart)
                .state(CommitState.DRAFT)
                .rallyCryId(request.getRallyCryId())
                .definingObjectiveId(request.getDefiningObjectiveId())
                .outcomeId(request.getOutcomeId())
                .build();
        return commitRepository.save(commit);
    }

    public Commit getCommit(UUID commitId) {
        return commitRepository.findById(commitId)
                .orElseThrow(() -> new ResourceNotFoundException("Commit not found: " + commitId));
    }

    public Commit updateCommit(UUID commitId, CommitRequest request) {
        Commit commit = getCommit(commitId);
        if (commit.getState() != CommitState.DRAFT) {
            throw new IllegalArgumentException("Can only update DRAFT commits");
        }
        if (request.getRallyCryId() != null) commit.setRallyCryId(request.getRallyCryId());
        if (request.getDefiningObjectiveId() != null) commit.setDefiningObjectiveId(request.getDefiningObjectiveId());
        if (request.getOutcomeId() != null) commit.setOutcomeId(request.getOutcomeId());
        return commitRepository.save(commit);
    }

    public List<Commit> getCommitsByWeek(UUID userId, String weekStart) {
        LocalDate date = LocalDate.parse(weekStart);
        return commitRepository.findByUserIdAndWeekStart(userId, date);
    }

    public List<Commit> getTeamCommits(UUID managerId, String weekStart) {
        List<User> reports = userRepository.findByManagerId(managerId);
        List<UUID> userIds = reports.stream().map(User::getId).collect(Collectors.toList());
        if (weekStart != null) {
            LocalDate date = LocalDate.parse(weekStart);
            return commitRepository.findByUserIdInAndWeekStart(userIds, date);
        }
        return commitRepository.findByUserIdIn(userIds);
    }

    // State transitions
    public Commit lockCommit(UUID commitId, UUID userId) {
        return applyTransition(commitId, userId, CommitEvent.LOCK);
    }

    public Commit startReconciliation(UUID commitId, UUID userId) {
        return applyTransition(commitId, userId, CommitEvent.START_RECONCILIATION);
    }

    public Commit completeReconciliation(UUID commitId, UUID userId) {
        return applyTransition(commitId, userId, CommitEvent.COMPLETE_RECONCILIATION);
    }

    public Commit carryForward(UUID commitId, UUID userId) {
        Commit original = applyTransition(commitId, userId, CommitEvent.CARRY_FORWARD);

        // Create new DRAFT commit for next week
        LocalDate nextWeek = original.getWeekStart().plusWeeks(1);
        Commit newCommit = Commit.builder()
                .userId(original.getUserId())
                .weekStart(nextWeek)
                .state(CommitState.DRAFT)
                .rallyCryId(original.getRallyCryId())
                .definingObjectiveId(original.getDefiningObjectiveId())
                .outcomeId(original.getOutcomeId())
                .originalCommitId(original.getId())
                .build();

        // Copy entries marked for carry-forward from reconciliation
        List<UUID> entryIds = original.getEntries().stream()
                .map(CommitEntry::getId).collect(Collectors.toList());
        List<ReconciliationEntry> recons = reconciliationRepository.findByCommitEntryIdIn(entryIds);

        newCommit = commitRepository.save(newCommit);

        int priority = 0;
        for (ReconciliationEntry recon : recons) {
            if (Boolean.TRUE.equals(recon.getCarryForward())) {
                CommitEntry originalEntry = entryRepository.findById(recon.getCommitEntryId()).orElse(null);
                if (originalEntry != null) {
                    CommitEntry newEntry = CommitEntry.builder()
                            .commit(newCommit)
                            .title(originalEntry.getTitle())
                            .description(originalEntry.getDescription())
                            .priority(priority++)
                            .build();
                    entryRepository.save(newEntry);
                }
            }
        }

        return newCommit;
    }

    private Commit applyTransition(UUID commitId, UUID userId, CommitEvent event) {
        Commit commit = getCommit(commitId);
        CommitState prevState = commit.getState();
        CommitState newState = stateMachine.transition(prevState, event);
        commit.setState(newState);
        commit = commitRepository.save(commit);

        // Log transition
        StateTransitionLog log = StateTransitionLog.builder()
                .commitId(commitId)
                .fromState(prevState.name())
                .toState(newState.name())
                .event(event.name())
                .triggeredBy(userId)
                .build();
        transitionLogRepository.save(log);

        return commit;
    }

    // Entry operations
    public CommitEntry addEntry(UUID commitId, CommitEntryRequest request) {
        Commit commit = getCommit(commitId);
        if (commit.getState() != CommitState.DRAFT) {
            throw new IllegalArgumentException("Can only add entries to DRAFT commits");
        }
        int maxPriority = commit.getEntries().stream()
                .mapToInt(CommitEntry::getPriority).max().orElse(-1);
        CommitEntry entry = CommitEntry.builder()
                .commit(commit)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : maxPriority + 1)
                .build();
        return entryRepository.save(entry);
    }

    public CommitEntry updateEntry(UUID commitId, UUID entryId, CommitEntryRequest request) {
        Commit commit = getCommit(commitId);
        if (commit.getState() != CommitState.DRAFT) {
            throw new IllegalArgumentException("Can only update entries in DRAFT commits");
        }
        CommitEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found: " + entryId));
        entry.setTitle(request.getTitle());
        if (request.getDescription() != null) entry.setDescription(request.getDescription());
        if (request.getPriority() != null) entry.setPriority(request.getPriority());
        return entryRepository.save(entry);
    }

    public void deleteEntry(UUID commitId, UUID entryId) {
        Commit commit = getCommit(commitId);
        if (commit.getState() != CommitState.DRAFT) {
            throw new IllegalArgumentException("Can only delete entries from DRAFT commits");
        }
        entryRepository.deleteById(entryId);
    }

    public List<CommitEntry> reorderEntries(UUID commitId, ReorderRequest request) {
        Commit commit = getCommit(commitId);
        if (commit.getState() != CommitState.DRAFT) {
            throw new IllegalArgumentException("Can only reorder entries in DRAFT commits");
        }
        List<UUID> orderedIds = request.getEntryIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            CommitEntry entry = entryRepository.findById(orderedIds.get(i))
                    .orElseThrow(() -> new ResourceNotFoundException("Entry not found"));
            entry.setPriority(i);
            entryRepository.save(entry);
        }
        return entryRepository.findByCommitIdOrderByPriorityAsc(commitId);
    }

    // Reconciliation
    public List<ReconciliationEntry> submitReconciliation(UUID commitId, ReconciliationRequest request) {
        Commit commit = getCommit(commitId);
        if (commit.getState() != CommitState.RECONCILING) {
            throw new IllegalArgumentException("Commit must be in RECONCILING state");
        }
        return request.getEntries().stream().map(item -> {
            ReconciliationEntry entry = ReconciliationEntry.builder()
                    .commitEntryId(item.getCommitEntryId())
                    .planned(item.getPlanned())
                    .actual(item.getActual())
                    .completionStatus(ReconciliationEntry.CompletionStatus.valueOf(
                            item.getCompletionStatus().toUpperCase()))
                    .carryForward(item.getCarryForward())
                    .notes(item.getNotes())
                    .build();
            return reconciliationRepository.save(entry);
        }).collect(Collectors.toList());
    }

    public List<ReconciliationEntry> getReconciliation(UUID commitId) {
        Commit commit = getCommit(commitId);
        List<UUID> entryIds = commit.getEntries().stream()
                .map(CommitEntry::getId).collect(Collectors.toList());
        return reconciliationRepository.findByCommitEntryIdIn(entryIds);
    }
}
