package com.backend.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize;

import com.backend.backend.model.User;
import com.backend.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(originPatterns = { "http://localhost:*", "http://127.0.0.1:*" })
public class UserController {
    @Autowired
    private UserService userService;

    // Create a new user
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return new ResponseEntity<>(java.util.Map.of("message", "Unauthorized"), HttpStatus.UNAUTHORIZED);
        }

        try {
            User createdUser = userService.createUserAsActor(authentication.getName(), user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (SecurityException ex) {
            return new ResponseEntity<>(java.util.Map.of("message", ex.getMessage()), HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException ex) {
            return new ResponseEntity<>(java.util.Map.of("message", ex.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return new ResponseEntity<>(java.util.Map.of("message", "Unauthorized"), HttpStatus.UNAUTHORIZED);
        }

        try {
            boolean deleted = userService.deleteUserAsActor(authentication.getName(), id);
            if (!deleted) {
                return new ResponseEntity<>(java.util.Map.of("message", "User not found"), HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (SecurityException ex) {
            return new ResponseEntity<>(java.util.Map.of("message", ex.getMessage()), HttpStatus.FORBIDDEN);
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return new ResponseEntity<>("Backend is running!", HttpStatus.OK);
    }

    // MongoDB connection test endpoint
    @GetMapping("/db-test")
    public ResponseEntity<String> mongoDbTestConnection() {
        try {
            List<User> users = userService.getAllUsers();
            return new ResponseEntity<>("✅ MongoDB Connected Successfully! Found " + users.size() + " users in database", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("❌ MongoDB Connection Failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check current user's role (diagnostic endpoint)
    @GetMapping("/check-role")
    public ResponseEntity<?> checkCurrentUserRole(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return new ResponseEntity<>(java.util.Map.of("error", "No authentication"), HttpStatus.UNAUTHORIZED);
        }

        String email = authentication.getName();
        java.util.List<String> roles = authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .toList();

        Optional<User> user = userService.getUserByEmail(email);
        if (!user.isPresent()) {
            return new ResponseEntity<>(java.util.Map.of(
                    "email", email,
                    "jwtRoles", roles,
                    "databaseRole", "USER NOT FOUND"
            ), HttpStatus.OK);
        }

        return new ResponseEntity<>(java.util.Map.of(
                "email", email,
                "jwtRoles", roles,
                "databaseRole", user.get().getRole(),
                "isAdmin", "ADMIN".equalsIgnoreCase(user.get().getRole()),
                "isSuperAdmin", "SUPER_ADMIN".equalsIgnoreCase(user.get().getRole())
        ), HttpStatus.OK);
    }

    // Get analytics data
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @GetMapping("/analytics/summary")
    public ResponseEntity<?> getAnalyticsSummary(Authentication authentication) {
        try {
            // Verify that the current user is ADMIN by checking database
            if (authentication == null || authentication.getName() == null) {
                return new ResponseEntity<>("Unauthorized: No authentication", HttpStatus.UNAUTHORIZED);
            }
            
            Optional<User> currentUser = userService.getUserByEmail(authentication.getName());
            if (!currentUser.isPresent()) {
                return new ResponseEntity<>("Unauthorized: User not found", HttpStatus.UNAUTHORIZED);
            }
            
            String currentRole = currentUser.get().getRole();
            if (!"ADMIN".equalsIgnoreCase(currentRole) && !"SUPER_ADMIN".equalsIgnoreCase(currentRole)) {
                return new ResponseEntity<>("Forbidden: Only ADMIN or SUPER_ADMIN users can access analytics", HttpStatus.FORBIDDEN);
            }
            
            List<User> allUsers = userService.getAllUsers();
            
            long adminCount = allUsers.stream()
                    .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()))
                    .count();
            long technicianCount = allUsers.stream()
                    .filter(u -> "TECHNICIAN".equalsIgnoreCase(u.getRole()))
                    .count();
            long userCount = allUsers.stream()
                    .filter(u -> "USER".equalsIgnoreCase(u.getRole()))
                    .count();
            
            java.util.Map<String, Object> analytics = new java.util.HashMap<>();
            analytics.put("totalUsers", allUsers.size());
            analytics.put("admins", adminCount);
            analytics.put("technicians", technicianCount);
            analytics.put("regularUsers", userCount);
            analytics.put("activeSessions", Math.min(allUsers.size(), 12));
            analytics.put("systemUptime", "99.8%");
            
            java.util.List<java.util.Map<String, Object>> roleDistribution = java.util.Arrays.asList(
                java.util.Map.of("name", "Admin", "value", adminCount, "fill", "#a855f7"),
                java.util.Map.of("name", "Technician", "value", technicianCount, "fill", "#3b82f6"),
                java.util.Map.of("name", "User", "value", userCount, "fill", "#64748b")
            );
            
            analytics.put("roleDistribution", roleDistribution);
            
            return new ResponseEntity<>(analytics, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching analytics: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update current user's profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateCurrentUserProfile(@RequestBody User profileData, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return new ResponseEntity<>(java.util.Map.of("error", "User not authenticated"), HttpStatus.UNAUTHORIZED);
        }

        String email = authentication.getName();
        Optional<User> existingUser = userService.getUserByEmail(email);
        
        if (!existingUser.isPresent()) {
            return new ResponseEntity<>(java.util.Map.of("error", "User not found"), HttpStatus.NOT_FOUND);
        }

        User user = existingUser.get();
        
        // Update profile fields (email cannot be changed)
        if (profileData.getName() != null && !profileData.getName().trim().isEmpty()) {
            user.setName(profileData.getName());
        }
        if (profileData.getPhone() != null) {
            user.setPhone(profileData.getPhone());
        }
        if (profileData.getDepartment() != null) {
            user.setDepartment(profileData.getDepartment());
        }

        User updatedUser = userService.updateUser(user.getId(), user);
        
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }
}
