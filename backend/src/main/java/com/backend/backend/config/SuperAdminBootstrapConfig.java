package com.backend.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.UserService;

import java.util.Optional;

@Configuration
public class SuperAdminBootstrapConfig {

    private static final Logger logger = LoggerFactory.getLogger(SuperAdminBootstrapConfig.class);

    @Value("${app.bootstrap.super-admin.email:}")
    private String bootstrapEmail;

    @Value("${app.bootstrap.super-admin.password:}")
    private String bootstrapPassword;

    @Value("${app.bootstrap.super-admin.name:System Super Admin}")
    private String bootstrapName;

    @Bean
    public CommandLineRunner seedInitialSuperAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (bootstrapEmail == null || bootstrapEmail.isBlank() ||
                    bootstrapPassword == null || bootstrapPassword.isBlank()) {
                return;
            }

            long superAdminCount = userRepository.countByRoleIgnoreCase(UserService.ROLE_SUPER_ADMIN);
            if (superAdminCount > 0) {
                return;
            }

            String normalizedEmail = bootstrapEmail.trim().toLowerCase();
            Optional<User> existing = userRepository.findByEmail(normalizedEmail);
            if (existing.isPresent()) {
                User existingUser = existing.get();
                existingUser.setRole(UserService.ROLE_SUPER_ADMIN);
                if (bootstrapPassword != null && !bootstrapPassword.isBlank()) {
                    existingUser.setPassword(passwordEncoder.encode(bootstrapPassword));
                }
                if (bootstrapName != null && !bootstrapName.isBlank()) {
                    existingUser.setName(bootstrapName.trim());
                }
                userRepository.save(existingUser);
                logger.info("Existing user promoted to SUPER_ADMIN for {}", normalizedEmail);
                return;
            }

            User superAdmin = new User();
            superAdmin.setName((bootstrapName == null || bootstrapName.isBlank())
                    ? "System Super Admin"
                    : bootstrapName.trim());
            superAdmin.setEmail(normalizedEmail);
            superAdmin.setPassword(passwordEncoder.encode(bootstrapPassword));
            superAdmin.setRole(UserService.ROLE_SUPER_ADMIN);

            userRepository.save(superAdmin);
            logger.info("Initial SUPER_ADMIN account created for {}", superAdmin.getEmail());
        };
    }
}
