package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.dto.CommitEntryRequest;
import com.st6.weeklycommit.dto.CommitRequest;
import com.st6.weeklycommit.dto.ReconciliationRequest;
import com.st6.weeklycommit.dto.ReorderRequest;
import com.st6.weeklycommit.entity.Commit;
import com.st6.weeklycommit.entity.CommitEntry;
import com.st6.weeklycommit.entity.ReconciliationEntry;
import com.st6.weeklycommit.service.CommitService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/commits")
public class CommitController {

    private final CommitService commitService;

    public CommitController(CommitService commitService) {
        this.commitService = commitService;
    }

    private UUID getUserId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<Commit> createCommit(@RequestBody CommitRequest request, Authentication auth) {
        return ResponseEntity.ok(commitService.createCommit(getUserId(auth), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Commit> getCommit(@PathVariable UUID id) {
        return ResponseEntity.ok(commitService.getCommit(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Commit> updateCommit(@PathVariable UUID id, @RequestBody CommitRequest request) {
        return ResponseEntity.ok(commitService.updateCommit(id, request));
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<Commit> lockCommit(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(commitService.lockCommit(id, getUserId(auth)));
    }

    @PostMapping("/{id}/reconcile")
    public ResponseEntity<Commit> startReconciliation(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(commitService.startReconciliation(id, getUserId(auth)));
    }

    @PutMapping("/{id}/reconciled")
    public ResponseEntity<Commit> completeReconciliation(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(commitService.completeReconciliation(id, getUserId(auth)));
    }

    @PostMapping("/{id}/carry-forward")
    public ResponseEntity<Commit> carryForward(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(commitService.carryForward(id, getUserId(auth)));
    }

    @GetMapping("/week/{weekStart}")
    public ResponseEntity<List<Commit>> getWeekCommits(@PathVariable String weekStart, Authentication auth) {
        return ResponseEntity.ok(commitService.getCommitsByWeek(getUserId(auth), weekStart));
    }

    @GetMapping("/team/{managerId}")
    public ResponseEntity<List<Commit>> getTeamCommits(
            @PathVariable UUID managerId,
            @RequestParam(required = false) String weekStart) {
        return ResponseEntity.ok(commitService.getTeamCommits(managerId, weekStart));
    }

    // Entry endpoints
    @PostMapping("/{commitId}/entries")
    public ResponseEntity<CommitEntry> addEntry(
            @PathVariable UUID commitId, @Valid @RequestBody CommitEntryRequest request) {
        return ResponseEntity.ok(commitService.addEntry(commitId, request));
    }

    @PutMapping("/{commitId}/entries/{entryId}")
    public ResponseEntity<CommitEntry> updateEntry(
            @PathVariable UUID commitId, @PathVariable UUID entryId,
            @Valid @RequestBody CommitEntryRequest request) {
        return ResponseEntity.ok(commitService.updateEntry(commitId, entryId, request));
    }

    @DeleteMapping("/{commitId}/entries/{entryId}")
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID commitId, @PathVariable UUID entryId) {
        commitService.deleteEntry(commitId, entryId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{commitId}/entries/reorder")
    public ResponseEntity<List<CommitEntry>> reorderEntries(
            @PathVariable UUID commitId, @RequestBody ReorderRequest request) {
        return ResponseEntity.ok(commitService.reorderEntries(commitId, request));
    }

    // Reconciliation endpoints
    @PostMapping("/{commitId}/reconciliation")
    public ResponseEntity<List<ReconciliationEntry>> submitReconciliation(
            @PathVariable UUID commitId, @RequestBody ReconciliationRequest request) {
        return ResponseEntity.ok(commitService.submitReconciliation(commitId, request));
    }

    @GetMapping("/{commitId}/reconciliation")
    public ResponseEntity<List<ReconciliationEntry>> getReconciliation(@PathVariable UUID commitId) {
        return ResponseEntity.ok(commitService.getReconciliation(commitId));
    }
}
