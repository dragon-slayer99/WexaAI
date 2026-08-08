package com.wexa.backend.controller;

import com.wexa.backend.dto.ArtistDTO;
import com.wexa.backend.dto.ArtistDetailsDTO;
import com.wexa.backend.service.ArtistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/artists")
@CrossOrigin(origins = "*")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @GetMapping("/{artistId}")
    public ResponseEntity<?> getArtistById(@PathVariable(name = "artistId") String artistId) {
        try {
            List<ArtistDetailsDTO> artistDetails = artistService.getArtistDetailsById(artistId);

            if (artistDetails == null || artistDetails.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            return ResponseEntity.ok(artistDetails.getFirst());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of(e.getMessage()));
        }
    }

    @GetMapping("/{name}/recommendations")
    public ResponseEntity<List> getRecommendations(@PathVariable(name = "name") String artistName) {
        try {

            List<ArtistDTO> artistsRecommendations = artistService.getArtistRecommendation(artistName);

            if (artistsRecommendations == null || artistsRecommendations.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(artistsRecommendations);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List> getArtistDetails(@RequestParam(name = "name") String artistName) {
        try {
            List<ArtistDetailsDTO> artistDetails = artistService.getArtistDetails(artistName);
            if (artistDetails == null || artistDetails.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            return ResponseEntity.ok(artistDetails);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of(e.getMessage()));
        }
    }


}
