package com.wexa.backend.service;


import com.wexa.backend.dto.PlaylistSongDTO;
import com.wexa.backend.dto.PlaylistsRecommendationDTO;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaylistService {

    private final Driver driver;


    public PlaylistService(Driver driver) {
        this.driver = driver;
    }

    public List<PlaylistsRecommendationDTO> getSimilarPlaylists(String playlistName) {
        String query = """
                MATCH (p1:Playlist)-[:CONTAINS]->(s:Song)<-[:CONTAINS]-(p2:Playlist)
                WHERE p1.name = $playlistName
                AND p1 <> p2
                RETURN p2.name AS recommendedName,
                       p2.mood AS mood,
                       count(s) AS sharedSongs
                ORDER BY sharedSongs DESC
                LIMIT 8
                """;
        try(Session session = driver.session()){
            return session.run(query, Values.parameters("playlistName", playlistName)).list(record -> new PlaylistsRecommendationDTO(
                    record.get("recommendedName").asString(),
                    record.get("mood").asString(),
                    record.get("sharedSongs").asInt()
            ));
        }

    }

    public List<PlaylistSongDTO> getPlaylistSongs(String playlistName) {
        String query = """
                MATCH (p:Playlist {name: $playlistName})-[:CONTAINS]->(s:Song)
                RETURN s.title AS songName, s.popularity AS popularity
                """;
        try (Session session = driver.session()) {
            return session.run(query, Values.parameters("playlistName", playlistName)).list(record -> new PlaylistSongDTO(
                    record.get("songName").asString(),
                    record.get("popularity").isNull() ? 0 : record.get("popularity").asInt()
            ));
        }
    }
}
