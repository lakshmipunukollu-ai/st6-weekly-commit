package com.st6.weeklycommit.service;

import com.st6.weeklycommit.dto.AuthRequest;
import com.st6.weeklycommit.dto.AuthResponse;
import com.st6.weeklycommit.dto.RegisterRequest;
import com.st6.weeklycommit.entity.User;
import com.st6.weeklycommit.repository.UserRepository;
import com.st6.weeklycommit.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User.Role role = request.getRole() != null ?
                User.Role.valueOf(request.getRole().toUpperCase()) : User.Role.MEMBER;

        UUID managerId = request.getManagerId() != null ?
                UUID.fromString(request.getManagerId()) : null;

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .managerId(managerId)
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, new AuthResponse.UserDto(
                user.getId(), user.getEmail(), user.getFullName(), user.getRole().name()));
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, new AuthResponse.UserDto(
                user.getId(), user.getEmail(), user.getFullName(), user.getRole().name()));
    }
}
