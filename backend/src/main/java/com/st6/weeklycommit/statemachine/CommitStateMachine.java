package com.st6.weeklycommit.statemachine;

import com.st6.weeklycommit.entity.Commit.CommitState;
import com.st6.weeklycommit.exception.InvalidTransitionException;
import org.springframework.stereotype.Component;

@Component
public class CommitStateMachine {

    public CommitState transition(CommitState current, CommitEvent event) {
        return switch (current) {
            case DRAFT -> switch (event) {
                case LOCK -> CommitState.LOCKED;
                default -> throw new InvalidTransitionException(current, event);
            };
            case LOCKED -> switch (event) {
                case START_RECONCILIATION -> CommitState.RECONCILING;
                default -> throw new InvalidTransitionException(current, event);
            };
            case RECONCILING -> switch (event) {
                case COMPLETE_RECONCILIATION -> CommitState.RECONCILED;
                default -> throw new InvalidTransitionException(current, event);
            };
            case RECONCILED -> switch (event) {
                case CARRY_FORWARD -> CommitState.CARRIED_FORWARD;
                default -> throw new InvalidTransitionException(current, event);
            };
            case CARRIED_FORWARD -> throw new InvalidTransitionException(current, event);
        };
    }

    public enum CommitEvent {
        LOCK,
        START_RECONCILIATION,
        COMPLETE_RECONCILIATION,
        CARRY_FORWARD
    }
}
