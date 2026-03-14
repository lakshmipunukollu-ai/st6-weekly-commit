package com.st6.weeklycommit.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ReconciliationRequest {
    private List<ReconciliationItem> entries;

    @Data
    public static class ReconciliationItem {
        private UUID commitEntryId;
        private String planned;
        private String actual;
        private String completionStatus;
        private Boolean carryForward;
        private String notes;
    }
}
