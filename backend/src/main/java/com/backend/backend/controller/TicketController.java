package com.backend.backend.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backend.backend.model.Ticket;
import com.backend.backend.model.TicketComment;
import com.backend.backend.model.User;
import com.backend.backend.service.TicketService;
import com.backend.backend.service.UserService;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5176" })
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    public TicketController(TicketService ticketService, UserService userService) {
        this.ticketService = ticketService;
        this.userService = userService;
    }

    private User getUser(Authentication auth) {
        return userService.getUserByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ─── POST /api/tickets — Create ticket ───────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, String> body,
                                          Authentication auth) {
        try {
            User user = getUser(auth);
            String title = body.get("title");
            String description = body.get("description");
            String category = body.get("category");
            String priority = body.get("priority");

            if (title == null || title.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Title is required"));
            }
            if (description == null || description.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Description is required"));
            }

            Ticket ticket = ticketService.createTicket(title, description, category, priority, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ─── GET /api/tickets — Get all (role-aware) ──────────────────────────────
    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(ticketService.getTicketsForUser(user));
    }

    // ─── GET /api/tickets/stats — Admin stats ─────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication auth) {
        User user = getUser(auth);
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin only"));
        }
        return ResponseEntity.ok(ticketService.getStats());
    }

    // ─── GET /api/tickets/technicians — Get all technician users ─────────────
    @GetMapping("/technicians")
    public ResponseEntity<?> getTechnicians(Authentication auth) {
        User user = getUser(auth);
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin only"));
        }
        return ResponseEntity.ok(ticketService.getTechnicians());
    }

    // ─── GET /api/tickets/search?q=keyword — Search ───────────────────────────
    @GetMapping("/search")
    public ResponseEntity<List<Ticket>> searchTickets(@RequestParam String q, Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(ticketService.searchTickets(q, user));
    }

    // ─── GET /api/tickets/{id} — Get ticket by ID ─────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable String id, Authentication auth) {
        User user = getUser(auth);
        Optional<Ticket> opt = ticketService.getTicketById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Ticket ticket = opt.get();
        // Enforce access: student can only see own tickets
        if ("USER".equals(user.getRole()) && !user.getId().equals(ticket.getCreatedByUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }
        if ("TECHNICIAN".equals(user.getRole()) && !user.getId().equals(ticket.getAssignedTechnicianId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }

        return ResponseEntity.ok(ticket);
    }

    // ─── PATCH /api/tickets/{id}/assign — Assign technician (Admin) ───────────
    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignTechnician(@PathVariable String id,
                                              @RequestBody Map<String, String> body,
                                              Authentication auth) {
        try {
            User user = getUser(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin only"));
            }

            String technicianId = body.get("technicianId");
            if (technicianId == null || technicianId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "technicianId required"));
            }

            Optional<Ticket> result = ticketService.assignTechnician(id, technicianId, user);
            return result.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── PATCH /api/tickets/{id}/status — Update status ──────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                          @RequestBody Map<String, String> body,
                                          Authentication auth) {
        try {
            User user = getUser(auth);
            String newStatus = body.get("status");
            String resolutionNote = body.get("resolutionNote");
            String rejectionReason = body.get("rejectionReason");

            if (newStatus == null || newStatus.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "status required"));
            }

            Optional<Ticket> result = ticketService.updateStatus(id, newStatus.toUpperCase(),
                    resolutionNote, rejectionReason, user);
            return result.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── DELETE /api/tickets/{id} — Delete (Admin) ────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable String id, Authentication auth) {
        User user = getUser(auth);
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin only"));
        }
        boolean deleted = ticketService.deleteTicket(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // ─── POST /api/tickets/{id}/upload — Upload images ────────────────────────
    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImages(@PathVariable String id,
                                          @RequestParam("files") List<MultipartFile> files,
                                          Authentication auth) {
        try {
            User user = getUser(auth);
            Optional<Ticket> ticketOpt = ticketService.getTicketById(id);
            if (ticketOpt.isEmpty()) return ResponseEntity.notFound().build();

            Ticket ticket = ticketOpt.get();
            if (!user.getId().equals(ticket.getCreatedByUserId()) && !"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
            }

            if (files.size() > 3 || (ticket.getImageUrls() != null && ticket.getImageUrls().size() + files.size() > 3)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Max 3 images allowed"));
            }

            List<String> uploadedUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                String url = ticketService.uploadImage(file);
                uploadedUrls.add(url);
            }

            Optional<Ticket> updated = ticketService.addImageUrls(id, uploadedUrls);
            return updated.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }

    // ─── GET /api/tickets/{id}/comments — Get comments ───────────────────────
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable String id,
                                                           Authentication auth) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    // ─── POST /api/tickets/{id}/comments — Add comment ───────────────────────
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id,
                                        @RequestBody Map<String, String> body,
                                        Authentication auth) {
        try {
            User user = getUser(auth);
            String content = body.get("content");
            if (content == null || content.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "content required"));
            }
            TicketComment comment = ticketService.addComment(id, content, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── PUT /api/tickets/{id}/comments/{cid} — Edit comment ─────────────────
    @PutMapping("/{id}/comments/{cid}")
    public ResponseEntity<?> editComment(@PathVariable String id,
                                         @PathVariable String cid,
                                         @RequestBody Map<String, String> body,
                                         Authentication auth) {
        User user = getUser(auth);
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "content required"));
        }
        Optional<TicketComment> result = ticketService.editComment(cid, content, user);
        if (result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Comment not found or not your comment"));
        }
        return ResponseEntity.ok(result.get());
    }

    // ─── DELETE /api/tickets/{id}/comments/{cid} — Delete comment ────────────
    @DeleteMapping("/{id}/comments/{cid}")
    public ResponseEntity<?> deleteComment(@PathVariable String id,
                                           @PathVariable String cid,
                                           Authentication auth) {
        User user = getUser(auth);
        boolean deleted = ticketService.deleteComment(cid, user);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Cannot delete this comment"));
    }
}
