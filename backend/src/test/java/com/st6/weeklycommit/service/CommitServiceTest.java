package com.st6.weeklycommit.service;

import com.st6.weeklycommit.dto.CommitRequest;
import com.st6.weeklycommit.dto.RegisterRequest;
import com.st6.weeklycommit.entity.Commit;
import com.st6.weeklycommit.entity.Commit.CommitState;
import com.st6.weeklycommit.exception.InvalidTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class CommitServiceTest {

    @Autowired
    private CommitService commitService;

    @Autowired
    private AuthService authService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("commit-test-" + System.currentTimeMillis() + "@test.com");
        reg.setPassword("password123");
        reg.setFullName("Commit Tester");
        reg.setRole("MEMBER");
        userId = authService.register(reg).getUser().getId();
    }

    @Test
    void createCommitInDraftState() {
        CommitRequest request = new CommitRequest();
        request.setWeekStart("2024-03-11");

        Commit commit = commitService.createCommit(userId, request);
        assertNotNull(commit.getId());
        assertEquals(CommitState.DRAFT, commit.getState());
        assertEquals(userId, commit.getUserId());
    }

    @Test
    void lockCommitTransition() {
        CommitRequest request = new CommitRequest();
        request.setWeekStart("2024-03-11");
        Commit commit = commitService.createCommit(userId, request);

        Commit locked = commitService.lockCommit(commit.getId(), userId);
        assertEquals(CommitState.LOCKED, locked.getState());
    }

    @Test
    void fullStateTransitionLifecycle() {
        CommitRequest request = new CommitRequest();
        request.setWeekStart("2024-03-11");
        Commit commit = commitService.createCommit(userId, request);

        commit = commitService.lockCommit(commit.getId(), userId);
        assertEquals(CommitState.LOCKED, commit.getState());

        commit = commitService.startReconciliation(commit.getId(), userId);
        assertEquals(CommitState.RECONCILING, commit.getState());

        commit = commitService.completeReconciliation(commit.getId(), userId);
        assertEquals(CommitState.RECONCILED, commit.getState());
    }

    @Test
    void cannotLockNonDraftCommit() {
        CommitRequest request = new CommitRequest();
        request.setWeekStart("2024-03-11");
        Commit commit = commitService.createCommit(userId, request);
        commitService.lockCommit(commit.getId(), userId);

        UUID commitId = commit.getId();
        assertThrows(InvalidTransitionException.class,
                () -> commitService.lockCommit(commitId, userId));
    }

    @Test
    void cannotUpdateLockedCommit() {
        CommitRequest request = new CommitRequest();
        request.setWeekStart("2024-03-11");
        Commit commit = commitService.createCommit(userId, request);
        commitService.lockCommit(commit.getId(), userId);

        CommitRequest update = new CommitRequest();
        UUID commitId = commit.getId();
        assertThrows(IllegalArgumentException.class,
                () -> commitService.updateCommit(commitId, update));
    }

    @Test
    void getCommitsByWeek() {
        CommitRequest request = new CommitRequest();
        request.setWeekStart("2024-04-01");
        commitService.createCommit(userId, request);

        var commits = commitService.getCommitsByWeek(userId, "2024-04-01");
        assertFalse(commits.isEmpty());
    }
}
