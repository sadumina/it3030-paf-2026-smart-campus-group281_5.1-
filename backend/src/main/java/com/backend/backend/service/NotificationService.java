package com.backend.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.backend.backend.model.Notification;
import com.backend.backend.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification createNotification(String userId, String type, String title, String message, String referenceType,
            String referenceId) {
        Notification notification = new Notification(userId, type, title, message, referenceType, referenceId);
        return notificationRepository.save(notification);
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
