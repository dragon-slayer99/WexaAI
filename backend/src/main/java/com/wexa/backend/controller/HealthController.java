package com.wexa.backend.controller;

import com.wexa.backend.service.HealthService;
import jakarta.annotation.PostConstruct;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @PostConstruct
    public void checkNeo4jConfig() {
        System.out.println("COGNO_DB_URI = " + System.getenv("COGNO_DB_URI"));
    }

    @GetMapping("/api/health")
    public Map checkHealth() {
        return healthService.getHealth();
    }

}
