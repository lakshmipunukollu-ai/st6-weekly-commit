package com.st6.weeklycommit.exception;

import com.st6.weeklycommit.entity.Commit.CommitState;
import com.st6.weeklycommit.statemachine.CommitStateMachine.CommitEvent;

public class InvalidTransitionException extends RuntimeException {
    public InvalidTransitionException(CommitState current, CommitEvent event) {
        super("Invalid transition: cannot apply event " + event + " to state " + current);
    }
}
