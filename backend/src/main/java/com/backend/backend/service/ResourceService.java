package com.backend.backend.service;

import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.backend.backend.model.Resource;
import com.backend.backend.repository.ResourceRepository;

@Service
public class ResourceService {
    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources(String type, Integer minCapacity, String location, String status) {
        ensureSampleResources();
        return resourceRepository.findAll().stream()
                .filter(resource -> matchesType(resource, type))
                .filter(resource -> matchesCapacity(resource, minCapacity))
                .filter(resource -> matchesLocation(resource, location))
                .filter(resource -> matchesStatus(resource, status))
                .toList();
    }

    public Resource getResourceById(String id) {
        ensureSampleResources();
        return resourceRepository.findById(id)
                .map(resource -> {
                    normalizeResourceFields(resource);
                    return resource;
                })
                .orElseThrow(() -> new NoSuchElementException("Resource not found"));
    }

    public Resource updateResourceStatus(String id, String status, String reason) {
        ensureSampleResources();
        String normalizedStatus = normalizeStatusInput(status);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Resource not found"));
        resource.setStatus(normalizedStatus);
        resource.setAvailability("ACTIVE".equals(normalizedStatus) ? "Available" : "Unavailable");
        resource.setStatusReason(reason);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource request) {
        ensureSampleResources();
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Resource not found"));

        if (request.getCapacity() != null && request.getCapacity() > 80) {
            throw new IllegalArgumentException("Resource capacity cannot exceed 80");
        }

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setImageUrl(request.getImageUrl());

        // Update availability windows (even if empty list is provided)
        if (request.getAvailabilityWindows() != null) {
            resource.setAvailabilityWindows(request.getAvailabilityWindows());
        }

        String requestStatus = request.getStatus();
        if (requestStatus != null && !requestStatus.isBlank()) {
            String normalizedStatus = normalizeStatusInput(requestStatus);
            resource.setStatus(normalizedStatus);
            resource.setAvailability("ACTIVE".equals(normalizedStatus) ? "Available" : "Unavailable");
        }

        normalizeResourceFields(resource);
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        ensureSampleResources();
        if (!resourceRepository.existsById(id)) {
            throw new NoSuchElementException("Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    public Resource createResource(Resource request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Resource name is required");
        }
        if (request.getType() == null || request.getType().isBlank()) {
            throw new IllegalArgumentException("Resource type is required");
        }
        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new IllegalArgumentException("Resource capacity must be greater than 0");
        }
        if (request.getCapacity() > 80) {
            throw new IllegalArgumentException("Resource capacity cannot exceed 80");
        }
        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new IllegalArgumentException("Resource location is required");
        }

        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setImageUrl(request.getImageUrl());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());

        String status = request.getStatus() != null && !request.getStatus().isBlank() 
            ? normalizeStatusInput(request.getStatus()) 
            : "ACTIVE";
        resource.setStatus(status);
        resource.setAvailability("ACTIVE".equals(status) ? "Available" : "Unavailable");

        return resourceRepository.save(resource);
    }

    private boolean matchesType(Resource resource, String type) {
        if (type == null || type.isBlank() || "ALL".equalsIgnoreCase(type)) {
            return true;
        }

        return getResourceType(resource).equalsIgnoreCase(type.trim());
    }

    private boolean matchesCapacity(Resource resource, Integer minCapacity) {
        if (minCapacity == null) {
            return true;
        }

        Integer resourceCapacity = resource.getCapacity();
        return resourceCapacity != null && resourceCapacity >= minCapacity;
    }

    private boolean matchesLocation(Resource resource, String location) {
        if (location == null || location.isBlank()) {
            return true;
        }

        return valueOrEmpty(resource.getLocation())
                .toLowerCase(Locale.ROOT)
                .contains(location.trim().toLowerCase(Locale.ROOT));
    }

    private boolean matchesStatus(Resource resource, String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return true;
        }

        return getResourceStatus(resource).equals(normalizeStatusInput(status));
    }

    private String getResourceType(Resource resource) {
        String type = resource.getType();
        if (type != null && !type.isBlank()) {
            return type;
        }

        String category = resource.getCategory();
        if (category == null || category.isBlank()) {
            return "";
        }

        if ("Laboratory".equalsIgnoreCase(category)) {
            return "Lab";
        }

        if ("Study Space".equalsIgnoreCase(category)) {
            return "Lecture Hall";
        }

        return category;
    }

    private String getResourceStatus(Resource resource) {
        return normalizeStatusForRead(resource.getStatus(), resource.getAvailability());
    }

    private String normalizeStatusInput(String status) {
        String normalized = valueOrEmpty(status)
                .trim()
                .toUpperCase(Locale.ROOT)
                .replace('-', '_')
                .replace(' ', '_');
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        if ("OUTOFSERVICE".equals(normalized)) {
            return "OUT_OF_SERVICE";
        }
        if (!"ACTIVE".equals(normalized) && !"OUT_OF_SERVICE".equals(normalized)) {
            throw new IllegalArgumentException("Status must be ACTIVE or OUT_OF_SERVICE");
        }
        return normalized;
    }

    private String normalizeStatusForRead(String status, String availability) {
        String normalized = valueOrEmpty(status)
                .trim()
                .toUpperCase(Locale.ROOT)
                .replace('-', '_')
                .replace(' ', '_');

        if ("OUTOFSERVICE".equals(normalized)) {
            return "OUT_OF_SERVICE";
        }

        if ("ACTIVE".equals(normalized)
                || "AVAILABLE".equals(normalized)
                || "IN_SERVICE".equals(normalized)
                || "ONLINE".equals(normalized)) {
            return "ACTIVE";
        }

        if ("OUT_OF_SERVICE".equals(normalized)
                || "UNAVAILABLE".equals(normalized)
                || "INACTIVE".equals(normalized)
                || "MAINTENANCE".equals(normalized)
                || "UNDER_MAINTENANCE".equals(normalized)
                || "OFFLINE".equals(normalized)) {
            return "OUT_OF_SERVICE";
        }

        if ("Unavailable".equalsIgnoreCase(valueOrEmpty(availability))) {
            return "OUT_OF_SERVICE";
        }

        // Keep reads resilient even when legacy data contains unexpected statuses.
        return "ACTIVE";
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private void ensureSampleResources() {
        if (resourceRepository.count() > 0) {
            normalizeExistingResources();
            return;
        }

        resourceRepository.saveAll(List.of(
                buildResource(
                        "Main Library Study Hall",
                        "Lecture Hall",
                        120,
                        "Library - Level 2",
                        "Active",
                        "Quiet shared study area with strong Wi-Fi and extended opening hours.",
                        "",
                        List.of("Mon-Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 3:00 PM")),
                buildResource(
                        "Innovation Lab A",
                        "Lab",
                        40,
                        "Engineering Block",
                        "Active",
                        "Computer lab with high-performance workstations for project work.",
                        "",
                        List.of("Mon-Fri: 9:00 AM - 5:00 PM")),
                buildResource(
                        "Media Equipment Kit",
                        "Equipment",
                        10,
                        "Media Center",
                        "Active",
                        "Portable camera, microphone, and lighting kit for student content creation.",
                        "",
                        List.of("Mon-Fri: 8:30 AM - 4:30 PM")),
                buildResource(
                        "Seminar Room B12",
                        "Meeting Room",
                        20,
                        "Business Building",
                        "Out of Service",
                        "Presentation room with projector, whiteboard, and 20-seat capacity.",
                        "",
                        List.of("Temporarily unavailable")),
                buildResource(
                        "Lecture Hall C1",
                        "Lecture Hall",
                        180,
                        "Science Faculty",
                        "Active",
                        "Large lecture hall with projector, sound system, and tiered seating.",
                        "",
                        List.of("Mon-Fri: 8:00 AM - 6:00 PM")),
                buildResource(
                        "Robotics Lab",
                        "Lab",
                        24,
                        "Technology Wing",
                        "Out of Service",
                        "Hands-on robotics workspace with testing benches and embedded systems kits.",
                        "",
                        List.of("Temporarily unavailable"))));
    }

    private void normalizeExistingResources() {
        List<Resource> resources = resourceRepository.findAll();
        boolean hasChanges = false;

        for (Resource resource : resources) {
            boolean changed = normalizeResourceFields(resource);
            if (changed) {
                hasChanges = true;
            }
        }

        if (hasChanges) {
            resourceRepository.saveAll(resources);
        }
    }

    private Integer getFallbackCapacity(Resource resource) {
        String normalizedType = getResourceType(resource);

        if ("Lecture Hall".equalsIgnoreCase(normalizedType)) {
            return 120;
        }

        if ("Lab".equalsIgnoreCase(normalizedType)) {
            return 40;
        }

        if ("Meeting Room".equalsIgnoreCase(normalizedType)) {
            return 20;
        }

        if ("Equipment".equalsIgnoreCase(normalizedType)) {
            return 10;
        }

        return null;
    }

    private boolean normalizeResourceFields(Resource resource) {
        boolean changed = false;

        if (resource.getType() == null || resource.getType().isBlank()) {
            String normalizedType = getResourceType(resource);
            if (!normalizedType.isBlank()) {
                resource.setType(normalizedType);
                changed = true;
            }
        }

        String normalizedStatus = getResourceStatus(resource);
        if (!normalizedStatus.equals(valueOrEmpty(resource.getStatus()))) {
            resource.setStatus(normalizedStatus);
            changed = true;
        }

        if (resource.getCapacity() == null) {
            Integer normalizedCapacity = getFallbackCapacity(resource);
            if (normalizedCapacity != null) {
                resource.setCapacity(normalizedCapacity);
                changed = true;
            }
        }

        if (resource.getAvailabilityWindows() == null || resource.getAvailabilityWindows().isEmpty()) {
            resource.setAvailabilityWindows(defaultAvailabilityWindows(getResourceType(resource), normalizedStatus));
            changed = true;
        }

        return changed;
    }

    private Resource buildResource(
            String name,
            String type,
            Integer capacity,
            String location,
            String status,
            String description,
            String imageUrl,
            List<String> availabilityWindows) {
        Resource resource = new Resource(name, type, capacity, location, status, description, imageUrl);
        resource.setAvailabilityWindows(availabilityWindows);
        return resource;
    }

    private List<String> defaultAvailabilityWindows(String type, String status) {
        if ("OUT_OF_SERVICE".equals(status)) {
            return List.of("Temporarily unavailable");
        }

        if ("LAB".equalsIgnoreCase(type)) {
            return List.of("Mon-Fri: 9:00 AM - 5:00 PM");
        }

        if ("EQUIPMENT".equalsIgnoreCase(type)) {
            return List.of("Mon-Fri: 8:30 AM - 4:30 PM");
        }

        return List.of("Mon-Fri: 8:00 AM - 6:00 PM");
    }
}
