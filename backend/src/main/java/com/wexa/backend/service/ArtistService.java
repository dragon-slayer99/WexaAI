package com.wexa.backend.service;

import com.wexa.backend.dto.ArtistDTO;

import com.wexa.backend.dto.ArtistDetailsDTO;
import org.neo4j.driver.*;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ArtistService {

    private final Driver driver;

    public ArtistService(Driver driver) {
        this.driver = driver;
    }

    public List<ArtistDTO> getArtistRecommendation(String artistName) {

        String query = """
                MATCH (a:Artist)-[:SIMILAR_TO]->(:Artist)-[:SIMILAR_TO]->(recommended:Artist)
                WHERE toLower(a.name) CONTAINS toLower($name)
                  AND recommended <> a
                RETURN DISTINCT
                       recommended.name AS name,
                       recommended.monthlyListeners AS popularity,
                       recommended.artistId AS id
                LIMIT 10
                """;
        try (Session session = driver.session()) {

            Result result = session.run(query, Values.parameters("name", artistName));
            return result.list(record -> new ArtistDTO(
                    record.get("name").asString(),
                    record.get("id").asString(),
                    record.get("popularity").isNull() ? 0 : record.get("popularity").asInt()
            ));

        }

    }

    public List<List<String>> getShortestPathBetweenSongs(String sourceSong, String targetSong) {

        String query = """
                MATCH p = shortestPath((s1:Song)-[*..10]-(s2:Song))
                WHERE s1.title = $source AND s2.title = $target
                RETURN [node in nodes(p) | labels(node)[0] + ': ' + coalesce(node.title, node.name)] AS path
                """;

        try (Session session = driver.session()) {

            return session.run(query, Values.parameters("source", sourceSong, "target", targetSong))
                    .stream()
                    .map(record -> record.get("path").asList(Value::asString)).toList();

        } catch (Exception e) {
            return List.of(List.of(e.getMessage()));
        }

    }

    public List<ArtistDetailsDTO> getArtistDetails(String artistName) {
        String query = """
                MATCH (a:Artist)
                WHERE toLower(a.name) CONTAINS toLower($name)
                OPTIONAL MATCH (a)-[:BELONGS_TO]->(g:Genre)
                OPTIONAL MATCH (a)-[:CREATED]->(s:Song)
                RETURN a.name AS name,
                       a.artistId AS id,
                       a.monthlyListeners AS popularity,
                       collect(DISTINCT g.name) AS genres,
                       collect(DISTINCT s.title) AS songs
                """;
        try (Session session = driver.session()) {
            return session.run(query, Values.parameters("name", artistName)).stream().map(record -> new ArtistDetailsDTO(
                    record.get("name").asString(),
                    record.get("id").asString(),
                    record.get("popularity").asInt(),
                    record.get("genres").asList(Value::asString),
                    record.get("songs").asList(Value::asString)
            )).toList();
        }

    }

    public List<ArtistDetailsDTO> getArtistDetailsById(String artistId) {
        String query = """
                MATCH (a:Artist {artistId: $id})
                OPTIONAL MATCH (a)-[:BELONGS_TO]->(g:Genre)
                OPTIONAL MATCH (a)-[:CREATED]->(s:Song)
                RETURN a.name AS name,
                       a.artistId AS id,
                       a.monthlyListeners AS popularity,
                       collect(DISTINCT g.name) AS genres,
                       collect(DISTINCT s.title) AS songs
                """;
        try (Session session = driver.session()) {
            return session.run(query, Values.parameters("id", artistId)).stream().map(record -> new ArtistDetailsDTO(
                    record.get("name").asString(),
                    record.get("id").asString(),
                    record.get("popularity").asInt(),
                    record.get("genres").asList(Value::asString),
                    record.get("songs").asList(Value::asString)
            )).toList();
        }

    }

    public List<ArtistDetailsDTO> getAllArtistsDetails() {
        String query = """
                MATCH (a:Artist)
                OPTIONAL MATCH (a)-[:BELONGS_TO]->(g:Genre)
                OPTIONAL MATCH (a)-[:CREATED]->(s:Song)
                RETURN a.name AS name,
                       a.artistId AS id,
                       a.monthlyListeners AS popularity,
                       collect(DISTINCT g.name) AS genres,
                       collect(DISTINCT s.title) AS songs
                """;
        try (Session session = driver.session()) {
            return session.run(query).stream().map(record -> new ArtistDetailsDTO(
                    record.get("name").asString(),
                    record.get("id").asString(),
                    record.get("popularity").asInt(),
                    record.get("genres").asList(Value::asString),
                    record.get("songs").asList(Value::asString)
            )).toList();
        }

    }
}
