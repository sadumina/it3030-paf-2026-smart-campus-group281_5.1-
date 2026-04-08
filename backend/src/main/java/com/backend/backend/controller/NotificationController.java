package com.backend.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.model.Notification;
import com.backend.backend.model.User;
import com.backend.backend.service.NotificationService;
import com.backend.backend.service.UserService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5176" })
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        Optional<User> user = userService.getUserByEmail(authentication.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(notificationService.getMyNotifications(user.get().getId()), HttpStatus.OK);
    }

    @GetMapping("/my/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        Optional<User> user = userService.getUserByEmail(authentication.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        long unreadCount = notificationService.getUnreadCount(user.get().getId());
        return new ResponseEntity<>(Map.of("unreadCount", unreadCount), HttpStatus.OK);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id, Authentication authentication) {
        Optional<User> user = userService.getUserByEmail(authentication.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Optional<Notification> notification = notificationService.markAsRead(user.get().getId(), id);
        return notification.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(Authentication authentication) {
        Optional<User> user = userService.getUserByEmail(authentication.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        int count = notificationService.markAllAsRead(user.get().getId());
        return new ResponseEntity<>(Map.of("updated", count), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id, Authentication authentication) {
        Optional<User> user = userService.getUserByEmail(authentication.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        boolean deleted = notificationService.deleteNotification(user.get().getId(), id);
        if (!deleted) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/seed")
    public ResponseEntity<Notification> createSeedNotification(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        Optional<User> user = userService.getUserByEmail(authentication.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Notification created = notificationService.createNotification(
                user.get().getId(),
                payload.getOrDefault("type", "SYSTEM"),
                payload.getOrDefault("title", "Campus update"),
                payload.getOrDefault("message", "You have a new update"),
                payload.getOrDefault("referenceType", "DASHBOARD"),
                payload.getOrDefault("referenceId", "N/A"));

        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
