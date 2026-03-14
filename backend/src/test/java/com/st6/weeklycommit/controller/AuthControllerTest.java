package com.st6.weeklycommit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.st6.weeklycommit.dto.AuthRequest;
import com.st6.weeklycommit.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerNewUser() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test-" + System.currentTimeMillis() + "@test.com");
        request.setPassword("password123");
        request.setFullName("Test User");
        request.setRole("MEMBER");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(request.getEmail()))
                .andExpect(jsonPath("$.user.fullName").value("Test User"));
    }

    @Test
    void loginWithValidCredentials() throws Exception {
        // First register
        String email = "login-test-" + System.currentTimeMillis() + "@test.com";
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail(email);
        registerReq.setPassword("password123");
        registerReq.setFullName("Login Test");
        registerReq.setRole("MEMBER");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        // Then login
        AuthRequest loginReq = new AuthRequest();
        loginReq.setEmail(email);
        loginReq.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(email));
    }

    @Test
    void loginWithInvalidCredentials() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("nonexistent@test.com");
        request.setPassword("wrong");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
