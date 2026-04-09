package com.backend.backend.controller;

import com.backend.backend.dto.AuthResponse;
import com.backend.backend.dto.FirebaseLoginRequest;
import com.backend.backend.dto.FirebaseRegisterRequest;
import com.backend.backend.model.User;
import com.backend.backend.service.FirebaseAuthenticationService;
import com.backend.backend.service.JwtService;
import com.backend.backend.service.UserService;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Firebase Authentication Controller
 * Handles Firebase-based login, registration, and OAuth
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class FirebaseAuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthController.class);
    
    @Autowired
    private FirebaseAuthenticationService firebaseAuthService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;

    /**
     * Firebase Email/Password Registration
     * POST /api/auth/firebase-register
     * 
     * Registers a new user in Smart Campus database
     * User is already created in Firebase by SDK
     */
    @PostMapping("/firebase-register")
    public ResponseEntity<?> firebaseRegister(@RequestBody FirebaseRegisterRequest request) {
        try {
            logger.info("Firebase registration request for: {}", request.getEmail());
            
            // Check if user already exists in Smart Campus
            if (userService.getUserByEmail(request.getEmail()) != null) {
                return ResponseEntity.badRequest().body(
                    new AuthResponse(false, "User already registered", null, null)
                );
            }
            
            // Create user in Smart Campus database
            User newUser = new User();
            newUser.setEmail(request.getEmail());
            newUser.setName(request.getName());
            newUser.setFirebaseUid(request.getFirebaseUid());
            newUser.setRole("USER"); // Default role for registration
            newUser.setPasswordHash("FIREBASE"); // No password hash for Firebase users
            
            User savedUser = userService.saveUser(newUser);
            
            // Generate JWT token for Smart Campus
            String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole());
            
            logger.info("User registered successfully: {}", request.getEmail());
            
            return ResponseEntity.ok(new AuthResponse(
                true,
                "Registration successful",
                token,
                "USER"
            ));
            
        } catch (Exception e) {
            logger.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new AuthResponse(false, e.getMessage(), null, null)
            );
        }
    }

    /**
     * Firebase Email/Password Login
     * POST /api/auth/firebase-login
     * 
     * Authenticates user with Firebase and issues Smart Campus JWT
     */
    @PostMapping("/firebase-login")
    public ResponseEntity<?> firebaseLogin(@RequestBody FirebaseLoginRequest request) {
        try {
            logger.info("Firebase login request for: {}", request.getEmail());
            
            // Verify Firebase ID token
            FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(request.getIdToken());
            if (decodedToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new AuthResponse(false, "Invalid Firebase token", null, null)
                );
            }
            
            // Get or create user in Smart Campus
            User user = userService.getUserByEmail(request.getEmail());
            if (user == null) {
                // Create new user if doesn't exist
                user = new User();
                user.setEmail(request.getEmail());
                user.setName(decodedToken.getName() != null ? decodedToken.getName() : "Firebase User");
                user.setFirebaseUid(request.getFirebaseUid());
                user.setRole("USER");
                user.setPasswordHash("FIREBASE");
                user = userService.saveUser(user);
                logger.info("New user created: {}", request.getEmail());
            } else {
                // Update Firebase UID if not already set
                if (user.getFirebaseUid() == null) {
                    user.setFirebaseUid(request.getFirebaseUid());
                    userService.saveUser(user);
                }
            }
            
            // Generate JWT token
            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            
            logger.info("User logged in successfully: {}", request.getEmail());
            
            return ResponseEntity.ok(new AuthResponse(
                true,
                "Login successful",
                token,
                user.getRole()
            ));
            
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new AuthResponse(false, e.getMessage(), null, null)
            );
        }
    }

    /**
     * Firebase Google OAuth Login
     * POST /api/auth/firebase-google
     * 
     * Authenticates user with Google OAuth via Firebase
     */
    @PostMapping("/firebase-google")
    public ResponseEntity<?> firebaseGoogleLogin(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            logger.info("Firebase Google login request");
            
            // Verify Firebase Google token
            FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken);
            if (decodedToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new AuthResponse(false, "Invalid Firebase token", null, null)
                );
            }
            
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();
            String firebaseUid = decodedToken.getUid();
            
            // Get or create user in Smart Campus
            User user = userService.getUserByEmail(email);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setFirebaseUid(firebaseUid);
                user.setRole("USER");
                user.setPasswordHash("GOOGLE_OAUTH");
                user = userService.saveUser(user);
                logger.info("New Google user created: {}", email);
            } else if (user.getFirebaseUid() == null) {
                user.setFirebaseUid(firebaseUid);
                userService.saveUser(user);
            }
            
            // Generate JWT token
            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            
            logger.info("Google user logged in: {}", email);
            
            return ResponseEntity.ok(new AuthResponse(
                true,
                "Google login successful",
                token,
                user.getRole()
            ));
            
        } catch (Exception e) {
            logger.error("Google login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new AuthResponse(false, e.getMessage(), null, null)
            );
        }
    }

    /**
     * Check Firebase Status
     * GET /api/auth/firebase-status
     */
    @GetMapping("/firebase-status")
    public ResponseEntity<?> firebaseStatus() {
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("initialized", firebaseAuthService.isInitialized());
            put("message", firebaseAuthService.isInitialized() 
                ? "Firebase is initialized and ready" 
                : "Firebase is not initialized");
        }});
    }
}

// DTO classes for Firebase
class FirebaseRegisterRequest {
    public String firebaseUid;
    public String email;
    public String name;
    
    public FirebaseRegisterRequest() {}
    
    public FirebaseRegisterRequest(String firebaseUid, String email, String name) {
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.name = name;
    }
    
    // Getters
    public String getFirebaseUid() { return firebaseUid; }
    public String getEmail() { return email; }
    public String getName() { return name; }
}

class FirebaseLoginRequest {
    public String firebaseUid;
    public String email;
    public String idToken;
    
    public FirebaseLoginRequest() {}
    
    // Getters
    public String getFirebaseUid() { return firebaseUid; }
    public String getEmail() { return email; }
    public String getIdToken() { return idToken; }
}
