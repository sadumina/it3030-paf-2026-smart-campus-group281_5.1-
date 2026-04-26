package com.backend.backend.service;

import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Firebase Authentication Service
 * Verifies Firebase ID tokens and manages authentication
 */
@Service
public class FirebaseAuthenticationService {
    
    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthenticationService.class);
    private FirebaseAuth firebaseAuth;

    public FirebaseAuthenticationService(@Value("${firebase.credentials.path}") String credentialsPath) {
        try {
            initializeFirebase(credentialsPath);
        } catch (IOException e) {
            logger.error("Failed to initialize Firebase", e);
        }
    }

    /**
     * Initialize Firebase with service account credentials
     */
    private void initializeFirebase(String credentialsPath) throws IOException {
        if (credentialsPath == null || credentialsPath.isBlank()) {
            logger.warn("Firebase credentials path is not configured. Firebase authentication will remain disabled.");
            return;
        }

        Path credentialsFile = Path.of(credentialsPath).toAbsolutePath().normalize();
        if (!Files.exists(credentialsFile)) {
            logger.warn("Firebase credentials file not found at {}. Firebase authentication will remain disabled.", credentialsFile);
            return;
        }

        if (FirebaseApp.getApps().isEmpty()) {
            try (FileInputStream serviceAccount = new FileInputStream(credentialsFile.toFile())) {
                FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(ServiceAccountCredentials.fromStream(serviceAccount))
                    .build();

                FirebaseApp.initializeApp(options);
                logger.info("Firebase initialized successfully using {}", credentialsFile);
            }
        }

        this.firebaseAuth = FirebaseAuth.getInstance();
    }

    /**
     * Verify Firebase ID token and extract user information
     * 
     * @param idToken Firebase ID token from client
     * @return FirebaseToken if valid, null otherwise
     */
    public FirebaseToken verifyIdToken(String idToken) {
        if (!isInitialized()) {
            logger.warn("Firebase token verification requested before Firebase was initialized.");
            return null;
        }

        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            logger.info("Token verified for user: {}", decodedToken.getEmail());
            return decodedToken;
        } catch (FirebaseAuthException e) {
            logger.error("Error verifying ID token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get Firebase user information
     * 
     * @param uid Firebase UID
     * @return Firebase user record
     * @throws FirebaseAuthException if user not found
     */
    public com.google.firebase.auth.UserRecord getUser(String uid) throws FirebaseAuthException {
        if (!isInitialized()) {
            throw new IllegalStateException("Firebase authentication is not initialized");
        }
        return firebaseAuth.getUser(uid);
    }

    /**
     * Create custom JWT token for verified Firebase user
     * This allows your CleverCampus system to use its own tokens
     * 
     * @param firebaseUid Firebase UID
     * @param email User email
     * @param role User role in CleverCampus
     * @return Custom JWT token
     */
    public String createCustomToken(String firebaseUid, String email, String role) {
        if (!isInitialized()) {
            logger.warn("Custom Firebase token requested before Firebase was initialized.");
            return null;
        }

        try {
            // Create claims to include in custom token
            java.util.Map<String, Object> claims = new java.util.HashMap<>();
            claims.put("firebaseUid", firebaseUid);
            claims.put("email", email);
            claims.put("role", role);
            
            String customToken = firebaseAuth.createCustomToken(firebaseUid, claims);
            logger.info("Custom token created for user: {}", email);
            return customToken;
        } catch (FirebaseAuthException e) {
            logger.error("Error creating custom token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if Firebase is properly initialized
     */
    public boolean isInitialized() {
        return !FirebaseApp.getApps().isEmpty() && firebaseAuth != null;
    }
}

