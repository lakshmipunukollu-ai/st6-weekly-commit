package com.st6.weeklycommit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommitEntryRequest {
    @NotBlank
    private String title;
    private String description;
    private Integer priority;
}
