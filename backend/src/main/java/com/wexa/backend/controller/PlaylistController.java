package com.wexa.backend.controller;

import com.wexa.backend.dto.PlaylistSongDTO;
import com.wexa.backend.dto.PlaylistsRecommendationDTO;
import com.wexa.backend.service.PlaylistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/playlist")
@CrossOrigin(origins = "*")
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @GetMapping("/{name}/similar")
    public ResponseEntity<List> getSimilarPlaylist(@PathVariable(name = "name") String playlistName) {
        try {
            List<PlaylistsRecommendationDTO> recommendations = playlistService.getSimilarPlaylists(playlistName);

            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of(e.getMessage()));
        }
    }

    @GetMapping("/{name}/songs")
    public ResponseEntity<List> getPlaylistSongs(@PathVariable(name = "name") String playlistName) {
        try {
            List<PlaylistSongDTO> songs = playlistService.getPlaylistSongs(playlistName);

            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of(e.getMessage()));
        }
    }
}
