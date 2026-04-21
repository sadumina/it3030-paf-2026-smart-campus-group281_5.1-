package com.backend.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.backend.backend.model.Ticket;
import com.backend.backend.model.User;
import com.backend.backend.repository.TicketRepository;
import com.backend.backend.repository.UserRepository;

@Component
public class SlaScheduler {

    private static final Map<String, Long> SLA_HOURS = Map.of(
        "CRITICAL", 1L,
        "HIGH",     4L,
        "MEDIUM",   24L,
        "LOW",      72L
    );

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SlaScheduler(TicketRepository ticketRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelay = 60_000)
    public void checkSlaBreaches() {
        List<Ticket> candidates = ticketRepository
            .findByStatusInAndSlaBreachedNotifiedFalse(List.of("OPEN", "IN_PROGRESS"));

        if (candidates.isEmpty()) return;

        Instant now = Instant.now();
        List<User> admins = userRepository.findAll().stream()
            .filter(u -> "ADMIN".equals(u.getRole()))
            .toList();

        for (Ticket ticket : candidates) {
            long slaHours = SLA_HOURS.getOrDefault(ticket.getPriority(), 24L);
            Instant deadline = ticket.getCreatedAt().plus(slaHours, ChronoUnit.HOURS);

            if (now.isAfter(deadline)) {
                String overdueText = formatOverdue(deadline, now);
                String notifTitle = "SLA Breached: " + ticket.getTicketId();
                String notifBody  = "[" + ticket.getPriority() + "] " + ticket.getTitle()
                    + " — overdue by " + overdueText;

                for (User admin : admins) {
                    notificationService.createNotification(
                        admin.getId(), "SLA_BREACH",
                        notifTitle, notifBody,
                        "TICKET", ticket.getId());
                }

                notificationService.createNotification(
                    ticket.getCreatedByUserId(), "SLA_BREACH",
                    "Your ticket " + ticket.getTicketId() + " is overdue",
                    "No response within the SLA window (" + slaHours + "h). We apologize for the delay.",
                    "TICKET", ticket.getId());

                ticket.setSlaBreachedNotified(true);
                ticketRepository.save(ticket);
            }
        }
    }

    private String formatOverdue(Instant deadline, Instant now) {
        long minutes = ChronoUnit.MINUTES.between(deadline, now);
        if (minutes < 60) return minutes + "m";
        long hours = minutes / 60;
        long mins  = minutes % 60;
        return hours + "h " + (mins > 0 ? mins + "m" : "");
    }
}
