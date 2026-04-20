package com.backend.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.backend.backend.model.Resource;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}
