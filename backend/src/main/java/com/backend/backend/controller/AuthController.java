package com.backend.backend.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.dto.AuthResponse;
import com.backend.backend.dto.GoogleAuthRequest;
import com.backend.backend.dto.LoginRequest;
import com.backend.backend.dto.RoleUpdateRequest;
import com.backend.backend.dto.RegisterRequest;
import com.backend.backend.dto.TokenRefreshRequest;
import com.backend.backend.model.User;
import com.backend.backend.service.GoogleTokenVerifierService;
import com.backend.backend.service.JwtService;
import com.backend.backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = { "http://localhost:*", "http://127.0.0.1:*" })
public class AuthController {

        private final UserService userService;
        private final JwtService jwtService;
        private final GoogleTokenVerifierService googleTokenVerifierService;

        public AuthController(
                        UserService userService,
                        JwtService jwtService,
                        GoogleTokenVerifierService googleTokenVerifierService) {
                this.userService = userService;
                this.jwtService = jwtService;
                this.googleTokenVerifierService = googleTokenVerifierService;
        }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (request.getName() == null || request.getName().isBlank() ||
                request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Name, email and password are required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        try {
            // Security: Ignore role from client - all new registrations start as USER
            // Admin/Technician roles are assigned by admins only
            User createdUser = userService.registerUser(
                    request.getName().trim(),
                    request.getEmail().trim().toLowerCase(),
                    request.getPassword(),
                    null); // Force USER role


            String token = jwtService.generateToken(
                    createdUser.getId(),
                    createdUser.getEmail(),
                    createdUser.getRole());

            return new ResponseEntity<>(
                    new AuthResponse(
                            true,
                            "Registration successful",
                            token,
                            createdUser.getId(),
                            createdUser.getName(),
                            createdUser.getEmail(),
                            createdUser.getRole()),
                    HttpStatus.CREATED);
        } catch (IllegalArgumentException exception) {
            return new ResponseEntity<>(
                    new AuthResponse(false, exception.getMessage(), null, null, null, null, null),
                    HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Email and password are required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        Optional<User> user = userService.loginUser(request.getEmail().trim().toLowerCase(), request.getPassword());
        if (user.isEmpty()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Invalid email or password", null, null, null, null, null),
                    HttpStatus.UNAUTHORIZED);
        }

        User foundUser = user.get();
        String token = jwtService.generateToken(
                foundUser.getId(),
                foundUser.getEmail(),
                foundUser.getRole());

        return new ResponseEntity<>(
                new AuthResponse(
                        true,
                        "Login successful",
                        token,
                        foundUser.getId(),
                        foundUser.getName(),
                        foundUser.getEmail(),
                        foundUser.getRole()),
                HttpStatus.OK);
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleAuthRequest request) {
        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Google ID token is required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        GoogleTokenVerifierService.GoogleUserInfo googleUserInfo = googleTokenVerifierService
                .verifyIdToken(request.getIdToken().trim());
        if (googleUserInfo == null) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Invalid Google token", null, null, null, null, null),
                    HttpStatus.UNAUTHORIZED);
        }

        User user = userService.findOrCreateGoogleUser(
                googleUserInfo.name(),
                googleUserInfo.email().trim().toLowerCase(),
                request.getRole());

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new ResponseEntity<>(
                new AuthResponse(true, "Google login successful", token, user.getId(), user.getName(), user.getEmail(),
                        user.getRole()),
                HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Token is required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        try {
            String email = jwtService.extractEmail(request.getToken().trim());
            Optional<User> user = userService.getUserByEmail(email);
            if (user.isEmpty()) {
                return new ResponseEntity<>(
                        new AuthResponse(false, "User not found", null, null, null, null, null),
                        HttpStatus.UNAUTHORIZED);
            }

            User found = user.get();
            String refreshedToken = jwtService.generateToken(found.getId(), found.getEmail(), found.getRole());
            return new ResponseEntity<>(
                    new AuthResponse(true, "Token refreshed", refreshedToken, found.getId(), found.getName(),
                            found.getEmail(), found.getRole()),
                    HttpStatus.OK);
        } catch (Exception ex) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Invalid token", null, null, null, null, null),
                    HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Unauthorized", null, null, null, null, null),
                    HttpStatus.UNAUTHORIZED);
        }

        Optional<User> user = userService.getUserByEmail(authentication.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "User not found", null, null, null, null, null),
                    HttpStatus.NOT_FOUND);
        }

        User found = user.get();
        String token = jwtService.generateToken(found.getId(), found.getEmail(), found.getRole());
        return new ResponseEntity<>(
                new AuthResponse(true, "Current user fetched", token, found.getId(), found.getName(), found.getEmail(),
                        found.getRole()),
                HttpStatus.OK);
    }

    @PatchMapping("/users/{id}/role")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<AuthResponse> updateRole(@PathVariable String id,
            @RequestBody RoleUpdateRequest request) {
        if (request.getRole() == null || request.getRole().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Role is required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        Optional<User> updated = userService.updateUserRole(id, request.getRole());
        if (updated.isEmpty()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "User not found", null, null, null, null, null),
                    HttpStatus.NOT_FOUND);
        }

        User user = updated.get();
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new ResponseEntity<>(
                new AuthResponse(true, "Role updated", token, user.getId(), user.getName(), user.getEmail(),
                        user.getRole()),
                HttpStatus.OK);
    }
}
