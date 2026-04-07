package com.backend.backend.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.dto.AuthResponse;
import com.backend.backend.dto.LoginRequest;
import com.backend.backend.dto.RegisterRequest;
import com.backend.backend.model.User;
import com.backend.backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5176" })
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (request.getName() == null || request.getName().isBlank() ||
                request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Name, email and password are required", null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        try {
            User createdUser = userService.registerUser(
                    request.getName().trim(),
                    request.getEmail().trim().toLowerCase(),
                    request.getPassword(),
                    request.getRole());

            return new ResponseEntity<>(
                    new AuthResponse(
                            true,
                            "Registration successful",
                            createdUser.getId(),
                            createdUser.getName(),
                            createdUser.getEmail(),
                            createdUser.getRole()),
                    HttpStatus.CREATED);
        } catch (IllegalArgumentException exception) {
            return new ResponseEntity<>(
                    new AuthResponse(false, exception.getMessage(), null, null, null, null),
                    HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Email and password are required", null, null, null, null),
                    HttpStatus.BAD_REQUEST);
        }

        Optional<User> user = userService.loginUser(request.getEmail().trim().toLowerCase(), request.getPassword());
        if (user.isEmpty()) {
            return new ResponseEntity<>(
                    new AuthResponse(false, "Invalid email or password", null, null, null, null),
                    HttpStatus.UNAUTHORIZED);
        }

        User foundUser = user.get();
        return new ResponseEntity<>(
                new AuthResponse(
                        true,
                        "Login successful",
                        foundUser.getId(),
                        foundUser.getName(),
                        foundUser.getEmail(),
                        foundUser.getRole()),
                HttpStatus.OK);
    }
}
