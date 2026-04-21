package com.backend.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    @Indexed(unique = true)
    private String ticketId; // TCK-YYYY-XXXX

    private String title;
    private String description;
    private String category; // ELECTRICAL, PLUMBING, IT, HVAC, STRUCTURAL, CLEANING, OTHER
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW
    private String status;   // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    // Location & contact
    private String location;        // e.g. "Block A, Room 204"
    private String contactDetails;  // preferred contact (phone / email / extension)

    // Creator info
    private String createdByUserId;
    private String createdByName;

    // Assigned technician info
    private String assignedTechnicianId;
    private String assignedTechnicianName;

    // Image paths (local file system, max 3)
    private List<String> imageUrls = new ArrayList<>();

    // Resolution / Rejection
    private String resolutionNote;
    private String rejectionReason;

    // SLA timestamps
    private Instant createdAt;
    private Instant updatedAt;
    private Instant firstResponseAt;
    private Instant resolvedAt;
    private Instant closedAt;

    // Embedded timeline events
    private List<TicketEvent> timeline = new ArrayList<>();

    public Ticket() {
        this.status = "OPEN";
        this.priority = "MEDIUM";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // ─── Embedded TicketEvent ────────────────────────────────────────────────
    public static class TicketEvent {
        private String eventType;      // CREATED, ASSIGNED, STATUS_CHANGED, COMMENT_ADDED, RESOLVED, CLOSED, REJECTED
        private String description;
        private String performedByUserId;
        private String performedByName;
        private String performedByRole;
        private Instant timestamp;

        public TicketEvent() {
            this.timestamp = Instant.now();
        }

        public TicketEvent(String eventType, String description, String performedByUserId,
                           String performedByName, String performedByRole) {
            this.eventType = eventType;
            this.description = description;
            this.performedByUserId = performedByUserId;
            this.performedByName = performedByName;
            this.performedByRole = performedByRole;
            this.timestamp = Instant.now();
        }

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPerformedByUserId() { return performedByUserId; }
        public void setPerformedByUserId(String performedByUserId) { this.performedByUserId = performedByUserId; }
        public String getPerformedByName() { return performedByName; }
        public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }
        public String getPerformedByRole() { return performedByRole; }
        public void setPerformedByRole(String performedByRole) { this.performedByRole = performedByRole; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }

    // ─── Getters & Setters ───────────────────────────────────────────────────
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }
    public String getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(String createdByUserId) { this.createdByUserId = createdByUserId; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public String getAssignedTechnicianId() { return assignedTechnicianId; }
    public void setAssignedTechnicianId(String assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; }
    public String getAssignedTechnicianName() { return assignedTechnicianName; }
    public void setAssignedTechnicianName(String assignedTechnicianName) { this.assignedTechnicianName = assignedTechnicianName; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getFirstResponseAt() { return firstResponseAt; }
    public void setFirstResponseAt(Instant firstResponseAt) { this.firstResponseAt = firstResponseAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public List<TicketEvent> getTimeline() { return timeline; }
    public void setTimeline(List<TicketEvent> timeline) { this.timeline = timeline; }

    public void addTimelineEvent(TicketEvent event) {
        if (this.timeline == null) this.timeline = new ArrayList<>();
        this.timeline.add(event);
    }
}
