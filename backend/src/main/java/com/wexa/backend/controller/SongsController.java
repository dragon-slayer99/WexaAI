package com.wexa.backend.controller;

import com.wexa.backend.service.ArtistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@CrossOrigin(origins = "*")
public class SongsController {

    private final ArtistService artistService;


    public SongsController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @GetMapping("/path")
    public ResponseEntity<List<List<String>>> getRelatedSongs(@RequestParam(name = "source") String source, @RequestParam(name = "target") String target) {
        List<List<String>> path = artistService.getShortestPathBetweenSongs(source, target);
        return ResponseEntity.ok(path);
    }
}
