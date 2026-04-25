package com.backend.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.backend.backend.model.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    // Custom query methods
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);
    boolean existsByEmail(String email);
    long countByRoleIgnoreCase(String role);
}
