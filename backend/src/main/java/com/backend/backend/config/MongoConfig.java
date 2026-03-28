package com.backend.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Override
    protected String getDatabaseName() {
        return "edusense";
    }

    // MongoClient is auto-configured by Spring Boot
    // No need to manually create it if using application.properties
}
