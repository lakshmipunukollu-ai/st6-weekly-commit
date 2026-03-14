package com.st6.weeklycommit.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CommitRequest {
    private String weekStart;
    private UUID rallyCryId;
    private UUID definingObjectiveId;
    private UUID outcomeId;
}
