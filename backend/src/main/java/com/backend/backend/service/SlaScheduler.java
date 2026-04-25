package com.backend.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.backend.backend.model.Ticket;
import com.backend.backend.model.Ticket.TicketEvent;
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

    private static final Map<String, String> NEXT_PRIORITY = Map.of(
        "LOW",    "MEDIUM",
        "MEDIUM", "HIGH",
        "HIGH",   "CRITICAL"
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
    public void checkSla() {
        Instant now = Instant.now();
        List<String> activeStatuses = List.of("OPEN", "IN_PROGRESS");

        List<User> admins = userRepository.findAll().stream()
            .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()) || "SUPER_ADMIN".equalsIgnoreCase(u.getRole()))
            .toList();

        checkEscalations(now, activeStatuses, admins);
        checkBreaches(now, activeStatuses, admins);
    }

    // ── Pass 1: auto-escalate priority at 75 % SLA consumed ─────────────────
    private void checkEscalations(Instant now, List<String> activeStatuses, List<User> admins) {
        List<Ticket> candidates = ticketRepository
            .findByStatusInAndPriorityEscalatedFalse(activeStatuses);

        for (Ticket ticket : candidates) {
            String currentPriority = ticket.getPriority();
            if (!NEXT_PRIORITY.containsKey(currentPriority)) continue; // already CRITICAL

            long slaHours   = SLA_HOURS.getOrDefault(currentPriority, 24L);
            long slaMinutes = slaHours * 60;
            long elapsed    = ChronoUnit.MINUTES.between(ticket.getCreatedAt(), now);

            if (elapsed < slaMinutes * 75 / 100) continue;

            String newPriority = NEXT_PRIORITY.get(currentPriority);

            ticket.setOriginalPriority(currentPriority);
            ticket.setPriority(newPriority);
            ticket.setPriorityEscalated(true);
            ticket.setUpdatedAt(now);
            ticket.addTimelineEvent(new TicketEvent(
                "PRIORITY_ESCALATED",
                "Priority auto-escalated from " + currentPriority + " to " + newPriority
                    + " (SLA " + slaHours + "h window 75 % consumed)",
                "SYSTEM", "System", "SYSTEM"));

            ticketRepository.save(ticket);

            String title = "Priority Escalated: " + ticket.getTicketId();
            String body  = ticket.getTitle() + " — " + currentPriority
                + " → " + newPriority + " (75 % of SLA consumed)";

            for (User admin : admins) {
                notificationService.createNotification(
                    admin.getId(), "PRIORITY_ESCALATED", title, body,
                    "TICKET", ticket.getId());
            }

            // Notify the assigned technician if any
            if (ticket.getAssignedTechnicianId() != null) {
                notificationService.createNotification(
                    ticket.getAssignedTechnicianId(), "PRIORITY_ESCALATED",
                    title, body, "TICKET", ticket.getId());
            }
        }
    }

    // ── Pass 2: SLA breach notification at 100 % consumed ────────────────────
    private void checkBreaches(Instant now, List<String> activeStatuses, List<User> admins) {
        List<Ticket> candidates = ticketRepository
            .findByStatusInAndSlaBreachedNotifiedFalse(activeStatuses);

        for (Ticket ticket : candidates) {
            // Use original priority for the SLA window so escalation doesn't shift the deadline
            String basePriority = ticket.getOriginalPriority() != null
                ? ticket.getOriginalPriority()
                : ticket.getPriority();

            long slaHours = SLA_HOURS.getOrDefault(basePriority, 24L);
            Instant deadline = ticket.getCreatedAt().plus(slaHours, ChronoUnit.HOURS);

            if (!now.isAfter(deadline)) continue;

            String overdueText = formatOverdue(deadline, now);
            String title = "SLA Breached: " + ticket.getTicketId();
            String body  = "[" + ticket.getPriority() + "] " + ticket.getTitle()
                + " — overdue by " + overdueText;

            for (User admin : admins) {
                notificationService.createNotification(
                    admin.getId(), "SLA_BREACH", title, body,
                    "TICKET", ticket.getId());
            }

            notificationService.createNotification(
                ticket.getCreatedByUserId(), "SLA_BREACH",
                "Your ticket " + ticket.getTicketId() + " is overdue",
                "No response within the SLA window (" + slaHours + "h). We apologise for the delay.",
                "TICKET", ticket.getId());

            ticket.setSlaBreachedNotified(true);
            ticketRepository.save(ticket);
        }
    }

    private String formatOverdue(Instant deadline, Instant now) {
        long minutes = ChronoUnit.MINUTES.between(deadline, now);
        if (minutes < 60) return minutes + "m";
        long hours = minutes / 60;
        long mins  = minutes % 60;
        return hours + "h" + (mins > 0 ? " " + mins + "m" : "");
    }
}
