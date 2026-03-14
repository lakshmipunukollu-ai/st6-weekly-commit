package com.st6.weeklycommit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDto user;

    @Data @AllArgsConstructor
    public static class UserDto {
        private UUID id;
        private String email;
        private String fullName;
        private String role;
    }
}
