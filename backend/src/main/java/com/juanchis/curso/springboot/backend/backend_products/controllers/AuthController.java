package com.juanchis.curso.springboot.backend.backend_products.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.juanchis.curso.springboot.backend.backend_products.dto.AuthResponse;
import com.juanchis.curso.springboot.backend.backend_products.dto.LoginRequest;
import com.juanchis.curso.springboot.backend.backend_products.dto.MessageResponse;
import com.juanchis.curso.springboot.backend.backend_products.dto.RegisterRequest;
import com.juanchis.curso.springboot.backend.backend_products.dto.TokenRefreshRequest;
import com.juanchis.curso.springboot.backend.backend_products.dto.UpdateProfileRequest;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import com.juanchis.curso.springboot.backend.backend_products.services.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@RequestBody RegisterRequest registerRequest) {
        MessageResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@RequestBody TokenRefreshRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(new MessageResponse("Logout exitoso"));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody UpdateProfileRequest request) {
        String token = authHeader.replace("Bearer ", "");
        AuthResponse response = authService.updateProfile(token, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/make-admin")
    public ResponseEntity<MessageResponse> makeAdmin(@RequestParam String email, @RequestParam String secret) {
        if (!"secreto_super_seguro_123".equals(secret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("No autorizado"));
        }
        MessageResponse response = authService.makeAdmin(email);
        return ResponseEntity.ok(response);
    }
}
