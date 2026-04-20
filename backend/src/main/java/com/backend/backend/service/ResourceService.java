package com.backend.backend.service;

import java.util.List;
import java.util.Locale;

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

        return getResourceStatus(resource).equalsIgnoreCase(status.trim());
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
        String status = resource.getStatus();
        if (status != null && !status.isBlank()) {
            return status;
        }

        String availability = resource.getAvailability();
        if (availability == null || availability.isBlank()) {
            return "";
        }

        if ("Unavailable".equalsIgnoreCase(availability)) {
            return "Out of Service";
        }

        return "Active";
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
                new Resource(
                        "Main Library Study Hall",
                        "Lecture Hall",
                        120,
                        "Library - Level 2",
                        "Active",
                        "Quiet shared study area with strong Wi-Fi and extended opening hours.",
                        ""),
                new Resource(
                        "Innovation Lab A",
                        "Lab",
                        40,
                        "Engineering Block",
                        "Active",
                        "Computer lab with high-performance workstations for project work.",
                        ""),
                new Resource(
                        "Media Equipment Kit",
                        "Equipment",
                        10,
                        "Media Center",
                        "Active",
                        "Portable camera, microphone, and lighting kit for student content creation.",
                        ""),
                new Resource(
                        "Seminar Room B12",
                        "Meeting Room",
                        20,
                        "Business Building",
                        "Out of Service",
                        "Presentation room with projector, whiteboard, and 20-seat capacity.",
                        ""),
                new Resource(
                        "Lecture Hall C1",
                        "Lecture Hall",
                        180,
                        "Science Faculty",
                        "Active",
                        "Large lecture hall with projector, sound system, and tiered seating.",
                        ""),
                new Resource(
                        "Robotics Lab",
                        "Lab",
                        24,
                        "Technology Wing",
                        "Out of Service",
                        "Hands-on robotics workspace with testing benches and embedded systems kits.",
                        "")));
    }

    private void normalizeExistingResources() {
        List<Resource> resources = resourceRepository.findAll();
        boolean hasChanges = false;

        for (Resource resource : resources) {
            if (resource.getType() == null || resource.getType().isBlank()) {
                String normalizedType = getResourceType(resource);
                if (!normalizedType.isBlank()) {
                    resource.setType(normalizedType);
                    hasChanges = true;
                }
            }

            if (resource.getStatus() == null || resource.getStatus().isBlank()) {
                String normalizedStatus = getResourceStatus(resource);
                if (!normalizedStatus.isBlank()) {
                    resource.setStatus(normalizedStatus);
                    hasChanges = true;
                }
            }

            if (resource.getCapacity() == null) {
                Integer normalizedCapacity = getFallbackCapacity(resource);
                if (normalizedCapacity != null) {
                    resource.setCapacity(normalizedCapacity);
                    hasChanges = true;
                }
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
}
