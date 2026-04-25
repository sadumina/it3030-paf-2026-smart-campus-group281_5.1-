package com.backend.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.backend.backend.model.TicketComment;

@Repository
public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {

    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    Optional<TicketComment> findByIdAndAuthorId(String id, String authorId);

    long countByTicketId(String ticketId);

    void deleteAllByTicketId(String ticketId);
}
