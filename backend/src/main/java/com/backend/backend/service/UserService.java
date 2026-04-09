package com.backend.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Create a new user
    public User createUser(User user) {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public User registerUser(String name, String email, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Validate that only USER/STUDENT roles are used during registration
        validateRegistrationRole(role);

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        // Force USER role for all new registrations
        user.setRole("USER");
        return userRepository.save(user);
    }

    public User findOrCreateGoogleUser(String name, String email, String role) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (name != null && !name.isBlank()) {
                user.setName(name);
            }
            if (user.getRole() == null || user.getRole().isBlank()) {
                // For Google auth, default to USER
                user.setRole("USER");
            }
            return userRepository.save(user);
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword("");
        // For Google auth new users, default to USER
        user.setRole("USER");
        return userRepository.save(user);
    }

    public Optional<User> updateUserRole(String id, String role) {
        return userRepository.findById(id).map(user -> {
            user.setRole(normalizeRole(role, user.getRole()));
            return userRepository.save(user);
        });
    }

    /**
     * Normalize and validate role for registration.
     * During REGISTRATION: Only USER role is allowed.
     * Role assignments (ADMIN, TECHNICIAN) must go through role update endpoint with admin verification.
     */
    private String normalizeRole(String role, String fallback) {
        if (role == null || role.isBlank()) {
            return fallback;
        }

        String normalized = role.trim().toUpperCase();
        if ("STUDENT".equals(normalized)) {
            return "USER";
        }
        // During registration, only USER role is allowed
        // ADMIN and TECHNICIAN roles must be assigned by admins
        return normalized;
    }

    /**
     * Validate role during registration - ONLY allow USER role.
     */
    private void validateRegistrationRole(String role) {
        if (role == null || role.isBlank()) {
            // Default to USER is fine
            return;
        }

        String normalized = role.trim().toUpperCase();
        // Allow STUDENT (will be converted to USER) or empty
        if ("STUDENT".equals(normalized) || "USER".equals(normalized)) {
            return;
        }
        // Reject ADMIN, TECHNICIAN, or any other role during registration
        throw new IllegalArgumentException(
            "Invalid registration role: " + normalized + ". Only student accounts can be created. "
            + "Admin and technician roles are assigned by administrators."
        );
    }

    public Optional<User> loginUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();
        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            return Optional.empty();
        }

        return Optional.of(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    // Get user by email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Update user
    public User updateUser(String id, User user) {
        user.setId(id);
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            userRepository.findById(id).ifPresent(existingUser -> user.setPassword(existingUser.getPassword()));
        }
        return userRepository.save(user);
    }

    // Delete user
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    // Delete all users
    public void deleteAllUsers() {
        userRepository.deleteAll();
    }
}
