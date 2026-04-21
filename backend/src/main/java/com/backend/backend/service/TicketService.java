package com.backend.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.backend.backend.model.Ticket;
import com.backend.backend.model.Ticket.TicketEvent;
import com.backend.backend.model.TicketComment;
import com.backend.backend.model.User;
import com.backend.backend.repository.TicketCommentRepository;
import com.backend.backend.repository.TicketRepository;
import com.backend.backend.repository.UserRepository;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:./uploads/tickets}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository commentRepository,
                         NotificationService notificationService,
                         UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // ─── Ticket ID Generation ────────────────────────────────────────────────
    private synchronized String generateTicketId() {
        int year = Year.now().getValue();
        long count = ticketRepository.count() + 1;
        String candidate;
        int attempts = 0;
        do {
            candidate = String.format("TCK-%d-%04d", year, count + attempts);
            attempts++;
        } while (ticketRepository.existsByTicketId(candidate) && attempts < 1000);
        return candidate;
    }

    // ─── Create Ticket ───────────────────────────────────────────────────────
    public Ticket createTicket(String title, String description, String category,
                               String priority, String location, String contactDetails, User creator) {
        Ticket ticket = new Ticket();
        ticket.setTicketId(generateTicketId());
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setPriority(priority == null ? "MEDIUM" : priority.toUpperCase());
        ticket.setLocation(location);
        ticket.setContactDetails(contactDetails);
        ticket.setStatus("OPEN");
        ticket.setCreatedByUserId(creator.getId());
        ticket.setCreatedByName(creator.getName());

        TicketEvent created = new TicketEvent(
                "CREATED",
                "Ticket created by " + creator.getName(),
                creator.getId(), creator.getName(), creator.getRole());
        ticket.addTimelineEvent(created);

        Ticket saved = ticketRepository.save(ticket);

        // Notify all admins
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .toList();
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(), "TICKET_CREATED",
                    "New Ticket: " + saved.getTicketId(),
                    creator.getName() + " raised " + title,
                    "TICKET", saved.getId());
        }

        return saved;
    }

    // ─── Get Tickets (role-aware, with optional filters) ────────────────────
    public List<Ticket> getTicketsForUser(User user, String status, String priority, String category) {
        List<Ticket> tickets = switch (user.getRole()) {
            case "ADMIN"      -> ticketRepository.findAllByOrderByCreatedAtDesc();
            case "TECHNICIAN" -> ticketRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(user.getId());
            default           -> ticketRepository.findByCreatedByUserIdOrderByCreatedAtDesc(user.getId());
        };

        if (status   != null && !status.isBlank())
            tickets = tickets.stream().filter(t -> status.equalsIgnoreCase(t.getStatus())).toList();
        if (priority != null && !priority.isBlank())
            tickets = tickets.stream().filter(t -> priority.equalsIgnoreCase(t.getPriority())).toList();
        if (category != null && !category.isBlank())
            tickets = tickets.stream().filter(t -> category.equalsIgnoreCase(t.getCategory())).toList();

        return tickets;
    }

    public Optional<Ticket> getTicketById(String id) {
        // Try by internal _id first, then by ticketId
        Optional<Ticket> byId = ticketRepository.findById(id);
        return byId;
    }

    // ─── Assign Technician (Admin only) ──────────────────────────────────────
    public Optional<Ticket> assignTechnician(String ticketId, String technicianId, User admin) {
        Optional<Ticket> opt = ticketRepository.findById(ticketId);
        if (opt.isEmpty()) return Optional.empty();

        Optional<User> techOpt = userRepository.findById(technicianId);
        if (techOpt.isEmpty() || !"TECHNICIAN".equals(techOpt.get().getRole())) {
            throw new IllegalArgumentException("User is not a technician");
        }

        Ticket ticket = opt.get();
        User tech = techOpt.get();

        ticket.setAssignedTechnicianId(tech.getId());
        ticket.setAssignedTechnicianName(tech.getName());
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
            if (ticket.getFirstResponseAt() == null) ticket.setFirstResponseAt(Instant.now());
        }
        ticket.setUpdatedAt(Instant.now());

        ticket.addTimelineEvent(new TicketEvent(
                "ASSIGNED",
                "Assigned to " + tech.getName() + " by " + admin.getName(),
                admin.getId(), admin.getName(), "ADMIN"));

        Ticket saved = ticketRepository.save(ticket);

        // Notify technician
        notificationService.createNotification(
                tech.getId(), "TICKET_ASSIGNED",
                "Ticket Assigned: " + saved.getTicketId(),
                "You have been assigned to handle: " + saved.getTitle(),
                "TICKET", saved.getId());

        // Notify creator
        notificationService.createNotification(
                ticket.getCreatedByUserId(), "TICKET_UPDATED",
                "Technician Assigned",
                "A technician has been assigned to your ticket " + saved.getTicketId(),
                "TICKET", saved.getId());

        return Optional.of(saved);
    }

    // ─── Update Status ────────────────────────────────────────────────────────
    public Optional<Ticket> updateStatus(String ticketId, String newStatus,
                                         String resolutionNote, String rejectionReason,
                                         User actor) {
        Optional<Ticket> opt = ticketRepository.findById(ticketId);
        if (opt.isEmpty()) return Optional.empty();

        Ticket ticket = opt.get();
        String currentStatus = ticket.getStatus();
        String role = actor.getRole();

        // Validate transitions
        validateTransition(currentStatus, newStatus, role);

        String eventType = switch (newStatus) {
            case "IN_PROGRESS" -> "STATUS_CHANGED";
            case "RESOLVED" -> "RESOLVED";
            case "CLOSED" -> "CLOSED";
            case "REJECTED" -> "REJECTED";
            default -> "STATUS_CHANGED";
        };

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(Instant.now());

        if ("RESOLVED".equals(newStatus)) {
            ticket.setResolvedAt(Instant.now());
            if (resolutionNote != null && !resolutionNote.isBlank()) {
                ticket.setResolutionNote(resolutionNote);
            }
        }
        if ("CLOSED".equals(newStatus)) {
            ticket.setClosedAt(Instant.now());
        }
        if ("REJECTED".equals(newStatus) && rejectionReason != null) {
            ticket.setRejectionReason(rejectionReason);
        }
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(Instant.now());
        }

        ticket.addTimelineEvent(new TicketEvent(
                eventType,
                "Status changed from " + currentStatus + " to " + newStatus + " by " + actor.getName(),
                actor.getId(), actor.getName(), role));

        Ticket saved = ticketRepository.save(ticket);

        // Notify creator
        notificationService.createNotification(
                ticket.getCreatedByUserId(), "TICKET_STATUS_CHANGED",
                "Ticket " + saved.getTicketId() + " → " + newStatus,
                "Your ticket status has been updated to " + newStatus,
                "TICKET", saved.getId());

        return Optional.of(saved);
    }

    private void validateTransition(String current, String next, String role) {
        boolean valid = switch (current) {
            case "OPEN" -> List.of("IN_PROGRESS", "REJECTED").contains(next) &&
                    ("ADMIN".equals(role) || ("IN_PROGRESS".equals(next) && "TECHNICIAN".equals(role)));
            case "IN_PROGRESS" -> (List.of("RESOLVED").contains(next) && "TECHNICIAN".equals(role)) ||
                    (List.of("REJECTED", "CLOSED").contains(next) && "ADMIN".equals(role));
            case "RESOLVED" -> "CLOSED".equals(next) && "ADMIN".equals(role);
            default -> false;
        };
        if (!valid) {
            throw new IllegalStateException("Invalid status transition: " + current + " → " + next + " for role " + role);
        }
    }

    // ─── Image Upload ─────────────────────────────────────────────────────────
    public String uploadImage(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + ext;
        Path targetPath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/tickets/" + filename;
    }

    // ─── Add Image URLs to Ticket ─────────────────────────────────────────────
    public Optional<Ticket> addImageUrls(String ticketId, List<String> urls) {
        return ticketRepository.findById(ticketId).map(ticket -> {
            List<String> existing = ticket.getImageUrls();
            if (existing == null) existing = new ArrayList<>();
            for (String url : urls) {
                if (existing.size() < 3) existing.add(url);
            }
            ticket.setImageUrls(existing);
            ticket.setUpdatedAt(Instant.now());
            return ticketRepository.save(ticket);
        });
    }

    // ─── Comments ─────────────────────────────────────────────────────────────
    public List<TicketComment> getComments(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment addComment(String ticketId, String content, User author) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) throw new IllegalArgumentException("Ticket not found");

        Ticket ticket = ticketOpt.get();
        TicketComment comment = new TicketComment(
                ticketId, author.getId(), author.getName(), author.getRole(), content);
        TicketComment saved = commentRepository.save(comment);

        // Add timeline event
        ticket.addTimelineEvent(new TicketEvent(
                "COMMENT_ADDED",
                author.getName() + " added a comment",
                author.getId(), author.getName(), author.getRole()));
        ticket.setUpdatedAt(Instant.now());
        ticketRepository.save(ticket);

        // Notify relevant parties (not the commenter)
        if (!author.getId().equals(ticket.getCreatedByUserId())) {
            notificationService.createNotification(
                    ticket.getCreatedByUserId(), "TICKET_COMMENT",
                    "New comment on " + ticket.getTicketId(),
                    author.getName() + ": " + (content.length() > 60 ? content.substring(0, 60) + "..." : content),
                    "TICKET", ticketId);
        }
        if (ticket.getAssignedTechnicianId() != null &&
                !author.getId().equals(ticket.getAssignedTechnicianId())) {
            notificationService.createNotification(
                    ticket.getAssignedTechnicianId(), "TICKET_COMMENT",
                    "New comment on " + ticket.getTicketId(),
                    author.getName() + ": " + (content.length() > 60 ? content.substring(0, 60) + "..." : content),
                    "TICKET", ticketId);
        }

        return saved;
    }

    public Optional<TicketComment> editComment(String commentId, String newContent, User actor) {
        return commentRepository.findByIdAndAuthorId(commentId, actor.getId()).map(comment -> {
            comment.setContent(newContent);
            comment.setEdited(true);
            comment.setUpdatedAt(Instant.now());
            return commentRepository.save(comment);
        });
    }

    public boolean deleteComment(String commentId, User actor) {
        Optional<TicketComment> opt;
        if ("ADMIN".equals(actor.getRole())) {
            opt = commentRepository.findById(commentId);
        } else {
            opt = commentRepository.findByIdAndAuthorId(commentId, actor.getId());
        }
        if (opt.isEmpty()) return false;
        commentRepository.deleteById(commentId);
        return true;
    }

    // ─── Delete Ticket (Admin only) ───────────────────────────────────────────
    public boolean deleteTicket(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) return false;
        commentRepository.deleteAllByTicketId(ticketId);
        ticketRepository.deleteById(ticketId);
        return true;
    }

    // ─── Stats (Admin Dashboard) ──────────────────────────────────────────────
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", ticketRepository.count());
        stats.put("open", ticketRepository.countByStatus("OPEN"));
        stats.put("inProgress", ticketRepository.countByStatus("IN_PROGRESS"));
        stats.put("resolved", ticketRepository.countByStatus("RESOLVED"));
        stats.put("closed", ticketRepository.countByStatus("CLOSED"));
        stats.put("rejected", ticketRepository.countByStatus("REJECTED"));
        stats.put("critical", ticketRepository.countByPriority("CRITICAL"));
        stats.put("high", ticketRepository.countByPriority("HIGH"));
        return stats;
    }

    // ─── Get Technicians ──────────────────────────────────────────────────────
    public List<User> getTechnicians() {
        return userRepository.findAll().stream()
                .filter(u -> "TECHNICIAN".equals(u.getRole()))
                .toList();
    }

    // ─── Search / Filter ─────────────────────────────────────────────────────
    public List<Ticket> searchTickets(String keyword, User user) {
        if ("ADMIN".equals(user.getRole())) {
            return ticketRepository.searchByKeyword(keyword);
        } else if ("TECHNICIAN".equals(user.getRole())) {
            return ticketRepository.searchByKeyword(keyword).stream()
                    .filter(t -> user.getId().equals(t.getAssignedTechnicianId()))
                    .toList();
        } else {
            return ticketRepository.searchByKeywordAndUser(keyword, user.getId());
        }
    }
}
