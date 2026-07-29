package com.juanchis.curso.springboot.backend.backend_products.services;

import com.juanchis.curso.springboot.backend.backend_products.dto.AuthResponse;
import com.juanchis.curso.springboot.backend.backend_products.dto.MessageResponse;
import com.juanchis.curso.springboot.backend.backend_products.dto.RegisterRequest;
import com.juanchis.curso.springboot.backend.backend_products.dto.LoginRequest;
import com.juanchis.curso.springboot.backend.backend_products.entities.RefreshToken;
import com.juanchis.curso.springboot.backend.backend_products.entities.User;
import com.juanchis.curso.springboot.backend.backend_products.repository.UserRepository;
import com.juanchis.curso.springboot.backend.backend_products.security.JwtUtils;
import com.juanchis.curso.springboot.backend.backend_products.dto.UpdateProfileRequest;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            AuthenticationManager authManager, JwtUtils jwtUtils, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
    }

    public MessageResponse register(RegisterRequest registerRequest) {
        if (registerRequest.getEmail() == null
                || !registerRequest.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de correo inválido");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo electrónico ya está registrado");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setLastname(registerRequest.getLastname());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        userRepository.save(user);

        return new MessageResponse("Usuario registrado exitosamente");
    }

    public MessageResponse makeAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        user.setRole("ROLE_ADMIN");
        userRepository.save(user);
        return new MessageResponse("Usuario actualizado a ADMIN");
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        refreshTokenService.deleteByUserId(user.getId());

        String token = jwtUtils.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        String userRole = user.getRole() != null ? user.getRole() : "ROLE_USER";
        return new AuthResponse(token, refreshToken.getToken(), user.getUsername(), userRole);
    }

    public AuthResponse refreshToken(String requestRefreshToken) {
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateToken(user.getEmail());
                    String userRole = user.getRole() != null ? user.getRole() : "ROLE_USER";
                    return new AuthResponse(token, requestRefreshToken, user.getUsername(), userRole);
                })
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token no encontrado"));
    }

    public void logout(String refreshToken) {
        refreshTokenService.findByToken(refreshToken).ifPresent(token -> {
            refreshTokenService.deleteByUserId(token.getUser().getId());
        });
    }

    public User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Usuario no encontrado: " + email));
    }

    public AuthResponse updateProfile(String token, UpdateProfileRequest request) {
        String oldEmail = jwtUtils.getEmailFromToken(token);

        User user = userRepository.findByEmail(oldEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        user.setUsername(request.getUsername());
        user.setLastname(request.getLastname());
        user.setEmail(request.getEmail());

        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);

        refreshTokenService.deleteByUserId(user.getId());
        String newToken = jwtUtils.generateToken(user.getEmail());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        String userRole = user.getRole() != null ? user.getRole() : "ROLE_USER";
        return new AuthResponse(newToken, newRefreshToken.getToken(), user.getUsername(), userRole);
    }
}
