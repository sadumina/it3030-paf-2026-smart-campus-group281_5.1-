package com.backend.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.backend.backend.model.Notification;
import com.backend.backend.model.User;
import com.backend.backend.repository.NotificationRepository;
import com.backend.backend.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification createNotification(String userId, String type, String title, String message, String referenceType,
            String referenceId) {
        Notification notification = new Notification(userId, type, title, message, referenceType, referenceId);
        return notificationRepository.save(notification);
    }

    public List<Notification> createNotificationsForRoles(Set<String> roles, String type, String title, String message,
            String referenceType, String referenceId) {
        Set<String> normalizedRoles = roles.stream()
                .map(role -> role == null ? "" : role.trim().toUpperCase())
                .collect(java.util.stream.Collectors.toSet());

        List<Notification> notifications = userRepository.findAll().stream()
                .filter(user -> normalizedRoles.contains(normalizeRole(user)))
                .map(user -> new Notification(user.getId(), type, title, message, referenceType, referenceId))
                .toList();

        return notificationRepository.saveAll(notifications);
    }

    public List<Notification> createNotificationsForAdmins(String type, String title, String message,
            String referenceType, String referenceId) {
        return createNotificationsForRoles(
                Set.of(UserService.ROLE_ADMIN, UserService.ROLE_SUPER_ADMIN),
                type,
                title,
                message,
                referenceType,
                referenceId);
    }

    private String normalizeRole(User user) {
        return user.getRole() == null ? "" : user.getRole().trim().toUpperCase();
    }

    public List<Notification> getMyNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Optional<Notification> markAsRead(String userId, String notificationId) {
        return notificationRepository.findById(notificationId)
                .filter(n -> n.getUserId().equals(userId))
                .map(notification -> {
                    notification.setRead(true);
                    return notificationRepository.save(notification);
                });
    }

    public int markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int changed = 0;
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                changed++;
            }
        }
        notificationRepository.saveAll(notifications);
        return changed;
    }

    public boolean deleteNotification(String userId, String notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUserId().equals(userId));

        if (notification.isEmpty()) {
            return false;
        }

        notificationRepository.deleteById(notificationId);
        return true;
    }
}
