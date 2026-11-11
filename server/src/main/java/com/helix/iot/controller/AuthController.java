package com.helix.iot.controller;

import com.helix.iot.dto.LoginRequest;
import com.helix.iot.dto.LoginResponse;
import com.helix.iot.entity.User;
import com.helix.iot.repository.UserRepository;
import com.helix.iot.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Vui lòng nhập đầy đủ tài khoản và mật khẩu!"));
        }

        String input = request.getUsername().trim();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(input, request.getPassword())
            );

            User user = userRepository.findByEmailOrStudentId(input, input)
                    .orElseThrow();

            String token = jwtUtils.generateToken(authentication.getName());

            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .user(LoginResponse.UserInfo.builder()
                            .id(user.getId())
                            .studentId(user.getStudentId())
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .className(user.getClassName())
                            .avatarUrl(user.getAvatarUrl())
                            .build())
                    .build();

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tài khoản hoặc mật khẩu không chính xác!"));
        }
    }
}