package com.backend.backend.controller;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.dto.AuthResponse;
import com.backend.backend.dto.FirebaseLoginRequest;
import com.backend.backend.dto.FirebaseRegisterRequest;
import com.backend.backend.model.User;
import com.backend.backend.service.FirebaseAuthenticationService;
import com.backend.backend.service.JwtService;
import com.backend.backend.service.UserService;
import com.google.firebase.auth.FirebaseToken;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = { "http://localhost:*", "http://127.0.0.1:*" })
public class FirebaseAuthController {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthController.class);

    private final FirebaseAuthenticationService firebaseAuthService;
    private final UserService userService;
    private final JwtService jwtService;

    public FirebaseAuthController(
            FirebaseAuthenticationService firebaseAuthService,
            UserService userService,
            JwtService jwtService) {
        this.firebaseAuthService = firebaseAuthService;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/firebase-register")
    public ResponseEntity<AuthResponse> firebaseRegister(@RequestBody FirebaseRegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() ||
                request.getName() == null || request.getName().isBlank() ||
                request.getFirebaseUid() == null || request.getFirebaseUid().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Name, email and firebaseUid are required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        String email = request.getEmail().trim().toLowerCase();
        Optional<User> existing = userService.getUserByEmail(email);
        if (existing.isPresent()) {
            User found = existing.get();
            String token = jwtService.generateToken(found.getId(), found.getEmail(), found.getRole());
            return new ResponseEntity<>(
                    new AuthResponse(true, "User already registered", token, found.getId(), found.getName(), found.getEmail(),
                            found.getRole()),
                    HttpStatus.OK);
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword("");
        user.setPasswordHash("FIREBASE");
        user.setFirebaseUid(request.getFirebaseUid().trim());
        user.setRole("USER");

        User created = userService.createUser(user);
        String token = jwtService.generateToken(created.getId(), created.getEmail(), created.getRole());

        logger.info("Firebase registration successful for {}", created.getEmail());
        return new ResponseEntity<>(
                new AuthResponse(true, "Registration successful", token, created.getId(), created.getName(),
                        created.getEmail(), created.getRole()),
                HttpStatus.CREATED);
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<AuthResponse> firebaseLogin(@RequestBody FirebaseLoginRequest request) {
        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Firebase ID token is required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(request.getIdToken().trim());
        if (decodedToken == null) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Invalid Firebase token", null, null, null, null, null),
                    HttpStatus.UNAUTHORIZED);
        }

        String email = (decodedToken.getEmail() == null ? request.getEmail() : decodedToken.getEmail());
        if (email == null || email.isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Email is required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        String normalizedEmail = email.trim().toLowerCase();
        String firebaseUid = decodedToken.getUid();

        User user = userService.getUserByEmail(normalizedEmail).orElseGet(() -> {
            User fresh = new User();
            fresh.setName(decodedToken.getName() != null ? decodedToken.getName() : "Firebase User");
            fresh.setEmail(normalizedEmail);
            fresh.setPassword("");
            fresh.setPasswordHash("FIREBASE");
            fresh.setFirebaseUid(firebaseUid);
            fresh.setRole("USER");
            return userService.createUser(fresh);
        });

        if (user.getFirebaseUid() == null || user.getFirebaseUid().isBlank()) {
            user.setFirebaseUid(firebaseUid);
            user = userService.updateUser(user.getId(), user);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        logger.info("Firebase login successful for {}", user.getEmail());

        return new ResponseEntity<>(
                new AuthResponse(true, "Login successful", token, user.getId(), user.getName(), user.getEmail(),
                        user.getRole()),
                HttpStatus.OK);
    }

    @PostMapping("/firebase-google")
    public ResponseEntity<AuthResponse> firebaseGoogleLogin(@RequestBody Map<String, String> request) {
        String idToken = request.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Google ID token is required", null, null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken.trim());
        if (decodedToken == null || decodedToken.getEmail() == null || decodedToken.getEmail().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Invalid Firebase token", null, null, null, null, null),
                    HttpStatus.UNAUTHORIZED);
        }

        String email = decodedToken.getEmail().trim().toLowerCase();
        User user = userService.findOrCreateGoogleUser(decodedToken.getName(), email, "USER");

        if (user.getFirebaseUid() == null || user.getFirebaseUid().isBlank()) {
            user.setFirebaseUid(decodedToken.getUid());
            user = userService.updateUser(user.getId(), user);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        logger.info("Firebase Google login successful for {}", user.getEmail());

        return new ResponseEntity<>(
                new AuthResponse(true, "Google login successful", token, user.getId(), user.getName(),
                        user.getEmail(), user.getRole()),
                HttpStatus.OK);
    }

    @GetMapping("/firebase-status")
    public ResponseEntity<Map<String, Object>> firebaseStatus() {
        boolean initialized = firebaseAuthService.isInitialized();
        return ResponseEntity.ok(Map.of(
                "initialized", initialized,
                "message", initialized ? "Firebase is initialized and ready" : "Firebase is not initialized"));
    }
}
