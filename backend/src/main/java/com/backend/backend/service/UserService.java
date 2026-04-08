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

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(normalizeRole(role, "USER"));
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
                user.setRole(normalizeRole(role, "USER"));
            }
            return userRepository.save(user);
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword("");
        user.setRole(normalizeRole(role, "USER"));
        return userRepository.save(user);
    }

    public Optional<User> updateUserRole(String id, String role) {
        return userRepository.findById(id).map(user -> {
            user.setRole(normalizeRole(role, user.getRole()));
            return userRepository.save(user);
        });
    }

    private String normalizeRole(String role, String fallback) {
        if (role == null || role.isBlank()) {
            return fallback;
        }

        String normalized = role.trim().toUpperCase();
        if ("STUDENT".equals(normalized)) {
            return "USER";
        }
        return normalized;
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
