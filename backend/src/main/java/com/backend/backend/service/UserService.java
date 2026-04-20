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
    public static final String ROLE_USER = "USER";
    public static final String ROLE_TECHNICIAN = "TECHNICIAN";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Create a new user
    public User createUser(User user) {
        String requestedRole = (user.getRole() == null || user.getRole().isBlank()) ? ROLE_USER : user.getRole();
        user.setRole(normalizeAssignableRole(requestedRole));
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public User createUserAsActor(String actorEmail, User user) {
        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new SecurityException("Unauthorized actor"));

        String actorRole = normalizeRoleOrDefault(actor.getRole(), ROLE_USER);
        String requestedRole = (user.getRole() == null || user.getRole().isBlank()) ? ROLE_USER : user.getRole();
        String normalizedRequestedRole = normalizeAssignableRole(requestedRole);

        if (ROLE_ADMIN.equals(actorRole) &&
                (ROLE_ADMIN.equals(normalizedRequestedRole) || ROLE_SUPER_ADMIN.equals(normalizedRequestedRole))) {
            throw new SecurityException("Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN accounts");
        }

        user.setRole(normalizedRequestedRole);

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
        user.setRole(ROLE_USER);
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
                user.setRole(ROLE_USER);
            }
            return userRepository.save(user);
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword("");
        // For Google auth new users, default to USER
        user.setRole(ROLE_USER);
        return userRepository.save(user);
    }

    public Optional<User> updateUserRole(String id, String role) {
        return userRepository.findById(id).map(user -> {
            user.setRole(normalizeAssignableRole(role));
            return userRepository.save(user);
        });
    }

    public Optional<User> updateUserRoleAsActor(String actorEmail, String targetUserId, String requestedRole) {
        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new SecurityException("Unauthorized actor"));
        Optional<User> targetOptional = userRepository.findById(targetUserId);
        if (targetOptional.isEmpty()) {
            return Optional.empty();
        }

        User target = targetOptional.get();
        String actorRole = normalizeRoleOrDefault(actor.getRole(), ROLE_USER);
        String targetRole = normalizeRoleOrDefault(target.getRole(), ROLE_USER);
        String normalizedRequestedRole = normalizeAssignableRole(requestedRole);

        if (ROLE_SUPER_ADMIN.equals(actorRole)) {
            // Protect against accidental lockout of the only SUPER_ADMIN account.
            if (actor.getId().equals(target.getId()) &&
                    !ROLE_SUPER_ADMIN.equals(normalizedRequestedRole) &&
                    userRepository.countByRoleIgnoreCase(ROLE_SUPER_ADMIN) <= 1) {
                throw new SecurityException("Cannot downgrade the last SUPER_ADMIN account");
            }

            target.setRole(normalizedRequestedRole);
            return Optional.of(userRepository.save(target));
        }

        if (ROLE_ADMIN.equals(actorRole)) {
            if (!isRoleManageableByAdmin(targetRole)) {
                throw new SecurityException("ADMIN cannot modify ADMIN or SUPER_ADMIN roles");
            }
            if (!isRoleManageableByAdmin(normalizedRequestedRole)) {
                throw new SecurityException("ADMIN can assign only USER or TECHNICIAN roles");
            }

            target.setRole(normalizedRequestedRole);
            return Optional.of(userRepository.save(target));
        }

        throw new SecurityException("Only ADMIN or SUPER_ADMIN can update roles");
    }

    public boolean deleteUserAsActor(String actorEmail, String targetUserId) {
        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new SecurityException("Unauthorized actor"));
        Optional<User> targetOptional = userRepository.findById(targetUserId);
        if (targetOptional.isEmpty()) {
            return false;
        }

        User target = targetOptional.get();
        String actorRole = normalizeRoleOrDefault(actor.getRole(), ROLE_USER);
        String targetRole = normalizeRoleOrDefault(target.getRole(), ROLE_USER);

        if (actor.getId().equals(target.getId())) {
            throw new SecurityException("You cannot delete your own account");
        }

        if (ROLE_SUPER_ADMIN.equals(actorRole)) {
            if (ROLE_SUPER_ADMIN.equals(targetRole)
                    && userRepository.countByRoleIgnoreCase(ROLE_SUPER_ADMIN) <= 1) {
                throw new SecurityException("Cannot delete the last SUPER_ADMIN account");
            }
            userRepository.deleteById(targetUserId);
            return true;
        }

        if (ROLE_ADMIN.equals(actorRole)) {
            if (!isRoleManageableByAdmin(targetRole)) {
                throw new SecurityException("ADMIN can delete only USER or TECHNICIAN accounts");
            }
            userRepository.deleteById(targetUserId);
            return true;
        }

        throw new SecurityException("Only ADMIN or SUPER_ADMIN can delete users");
    }

    /**
     * Normalize and validate role for registration.
     * During REGISTRATION: Only USER role is allowed.
     * Role assignments (ADMIN, TECHNICIAN) must go through role update endpoint with admin verification.
     */
    private String normalizeRoleOrDefault(String role, String fallback) {
        if (role == null || role.isBlank()) {
            return fallback;
        }

        String normalized = role.trim().toUpperCase();
        if ("STUDENT".equals(normalized)) {
            return ROLE_USER;
        }
        return normalized;
    }

    private String normalizeAssignableRole(String role) {
        String normalized = normalizeRoleOrDefault(role, ROLE_USER);
        if (ROLE_USER.equals(normalized) ||
                ROLE_TECHNICIAN.equals(normalized) ||
                ROLE_ADMIN.equals(normalized) ||
                ROLE_SUPER_ADMIN.equals(normalized)) {
            return normalized;
        }

        throw new IllegalArgumentException("Invalid role: " + normalized);
    }

    private boolean isRoleManageableByAdmin(String role) {
        return ROLE_USER.equals(role) || ROLE_TECHNICIAN.equals(role);
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
        if ("STUDENT".equals(normalized) || ROLE_USER.equals(normalized)) {
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
        Optional<User> existingOptional = userRepository.findById(id);
        if (existingOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User existingUser = existingOptional.get();
        user.setId(id);
        // Role changes are only allowed via role update endpoint.
        user.setRole(existingUser.getRole());

        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(existingUser.getPassword());
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
