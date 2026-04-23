package com.backend.backend.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.backend.backend.model.Ticket;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByCreatedByUserIdOrderByCreatedAtDesc(String userId);

    List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(String technicianId);

    List<Ticket> findAllByOrderByCreatedAtDesc();

    List<Ticket> findByStatusOrderByCreatedAtDesc(String status);

    List<Ticket> findByPriorityOrderByCreatedAtDesc(String priority);

    List<Ticket> findByCategoryOrderByCreatedAtDesc(String category);

    List<Ticket> findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc(String technicianId, String status);

    List<Ticket> findByCreatedAtBetweenOrderByCreatedAtDesc(Instant from, Instant to);

    boolean existsByTicketId(String ticketId);

    long countByStatus(String status);

    long countByPriority(String priority);

    long countByCreatedByUserId(String userId);

    List<Ticket> findByStatusInAndSlaBreachedNotifiedFalse(List<String> statuses);

    List<Ticket> findByStatusInAndPriorityEscalatedFalse(List<String> statuses);

    @Query("{ '$or': [ { 'ticketId': { '$regex': ?0, '$options': 'i' } }, { 'title': { '$regex': ?0, '$options': 'i' } }, { 'description': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Ticket> searchByKeyword(String keyword);

    @Query("{ '$or': [ { 'ticketId': { '$regex': ?0, '$options': 'i' } }, { 'title': { '$regex': ?0, '$options': 'i' } }, { 'description': { '$regex': ?0, '$options': 'i' } } ], 'createdByUserId': ?1 }")
    List<Ticket> searchByKeywordAndUser(String keyword, String userId);
}
