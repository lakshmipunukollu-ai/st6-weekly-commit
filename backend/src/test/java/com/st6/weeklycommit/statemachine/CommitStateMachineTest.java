package com.st6.weeklycommit.statemachine;

import com.st6.weeklycommit.entity.Commit.CommitState;
import com.st6.weeklycommit.exception.InvalidTransitionException;
import com.st6.weeklycommit.statemachine.CommitStateMachine.CommitEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CommitStateMachineTest {

    private CommitStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new CommitStateMachine();
    }

    @Test
    void draftToLocked() {
        assertEquals(CommitState.LOCKED, stateMachine.transition(CommitState.DRAFT, CommitEvent.LOCK));
    }

    @Test
    void lockedToReconciling() {
        assertEquals(CommitState.RECONCILING, stateMachine.transition(CommitState.LOCKED, CommitEvent.START_RECONCILIATION));
    }

    @Test
    void reconcilingToReconciled() {
        assertEquals(CommitState.RECONCILED, stateMachine.transition(CommitState.RECONCILING, CommitEvent.COMPLETE_RECONCILIATION));
    }

    @Test
    void reconciledToCarriedForward() {
        assertEquals(CommitState.CARRIED_FORWARD, stateMachine.transition(CommitState.RECONCILED, CommitEvent.CARRY_FORWARD));
    }

    @Test
    void invalidTransitionFromDraft() {
        assertThrows(InvalidTransitionException.class,
                () -> stateMachine.transition(CommitState.DRAFT, CommitEvent.START_RECONCILIATION));
    }

    @Test
    void invalidTransitionFromLocked() {
        assertThrows(InvalidTransitionException.class,
                () -> stateMachine.transition(CommitState.LOCKED, CommitEvent.LOCK));
    }

    @Test
    void invalidTransitionFromCarriedForward() {
        assertThrows(InvalidTransitionException.class,
                () -> stateMachine.transition(CommitState.CARRIED_FORWARD, CommitEvent.LOCK));
    }

    @Test
    void fullLifecycle() {
        CommitState state = CommitState.DRAFT;
        state = stateMachine.transition(state, CommitEvent.LOCK);
        assertEquals(CommitState.LOCKED, state);

        state = stateMachine.transition(state, CommitEvent.START_RECONCILIATION);
        assertEquals(CommitState.RECONCILING, state);

        state = stateMachine.transition(state, CommitEvent.COMPLETE_RECONCILIATION);
        assertEquals(CommitState.RECONCILED, state);

        state = stateMachine.transition(state, CommitEvent.CARRY_FORWARD);
        assertEquals(CommitState.CARRIED_FORWARD, state);
    }
}
