package com.wexa.backend.service;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class HealthService {


    private final Driver driver;

    public HealthService(Driver driver) {
        this.driver = driver;
    }

    public Map getHealth() {
        try (Session session = driver.session()) {

            String totalNodeQuery = "MATCH (n) RETURN count(n) AS totalNodes";
            Result result = session.run(totalNodeQuery);
            int totalNodes = result.single().get("totalNodes").asInt();
            return Map.of("status", "Database connected", "totalNodes", totalNodes);

        } catch (Exception e) {
            return Map.of("status", "Connection Failed", "error", e.getMessage());
        }
    }

}
