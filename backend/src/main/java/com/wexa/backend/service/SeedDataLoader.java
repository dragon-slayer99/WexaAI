package com.wexa.backend.service;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;


@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class SeedDataLoader implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedDataLoader.class);

    private static final Set<String> NUMERIC_COLUMNS = Set.of("monthlyListeners", "popularity");

    private final Driver driver;
    private final ResourceLoader resourceLoader;
    private final String dataLocation;

    public SeedDataLoader(Driver driver,
                          ResourceLoader resourceLoader,
                          @Value("${app.seed.data-location:classpath:data/}") String dataLocation) {
        this.driver = driver;
        this.resourceLoader = resourceLoader;
        this.dataLocation = dataLocation;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Seeding graph data from {}", dataLocation);
        try (Session session = driver.session()) {
            seedNodes(session, "Artist", "artists.csv", "artistId",
                    Map.of("name", "name", "monthlyListeners", "monthlyListeners"));
            seedNodes(session, "Song", "songs.csv", "songId",
                    Map.of("title", "title", "popularity", "popularity"));
            seedNodes(session, "Genre", "genres.csv", "genreId",
                    Map.of("name", "name"));
            seedNodes(session, "Album", "albums.csv", "albumId",
                    Map.of("title", "name"));
            seedNodes(session, "Playlist", "playlists.csv", "playlistId",
                    Map.of("name", "name", "mood", "mood"));

            seedRelationships(session, "CREATED", "artist_song.csv",
                    "artistId", "Artist", "artistId", "songId", "Song", "songId");
            seedRelationships(session, "BELONGS_TO", "artist_genre.csv",
                    "artistId", "Artist", "artistId", "genreId", "Genre", "genreId");
            seedRelationships(session, "SIMILAR_TO", "artist_similarity.csv",
                    "sourceArtistId", "Artist", "artistId", "targetArtistId", "Artist", "artistId");
            seedRelationships(session, "PART_OF", "song_album.csv",
                    "songId", "Song", "songId", "albumId", "Album", "albumId");
            seedRelationships(session, "CONTAINS", "playlist_song.csv",
                    "playlistId", "Playlist", "playlistId", "songId", "Song", "songId");
            seedRelationships(session, "RELATED_TO", "genre_relationship.csv",
                    "sourceGenreId", "Genre", "genreId", "targetGenreId", "Genre", "genreId");

            logVerification(session);
        } catch (Exception e) {
            log.error("Seed data loading failed. The graph may be incomplete.", e);
        }
    }

    private void seedNodes(Session session, String label, String csvFile, String keyColumn,
                           Map<String, String> props) {
        List<Map<String, String>> rows = loadRows(csvFile);
        if (rows.isEmpty()) {
            return;
        }

        StringBuilder setClause = new StringBuilder();
        props.forEach((csvColumn, property) -> {
            String value = NUMERIC_COLUMNS.contains(csvColumn)
                    ? "toInteger(row." + csvColumn + ")"
                    : "row." + csvColumn;
            setClause.append(", n.").append(property).append(" = ").append(value);
        });

        String query = "UNWIND $rows AS row\n"
                + "MERGE (n:" + label + " {" + keyColumn + ": row." + keyColumn + "})\n"
                + "SET " + setClause.substring(2);

        session.executeWrite(tx -> {
            tx.run(query, Values.parameters("rows", rows));
            return null;
        });
        log.info("Seeded {} {} nodes from {}", rows.size(), label, csvFile);
    }

    private void seedRelationships(Session session, String type, String csvFile,
                                   String srcColumn, String srcLabel, String srcKey,
                                   String dstColumn, String dstLabel, String dstKey) {
        List<Map<String, String>> rows = loadRows(csvFile);
        if (rows.isEmpty()) {
            return;
        }

        String query = "UNWIND $rows AS row\n"
                + "MATCH (a:" + srcLabel + " {" + srcKey + ": row." + srcColumn + "})\n"
                + "MATCH (b:" + dstLabel + " {" + dstKey + ": row." + dstColumn + "})\n"
                + "MERGE (a)-[:" + type + "]->(b)";

        session.executeWrite(tx -> {
            tx.run(query, Values.parameters("rows", rows));
            return null;
        });
        log.info("Seeded {} {} relationships from {}", rows.size(), type, csvFile);
    }

    private List<Map<String, String>> loadRows(String csvFile) {
        Resource resource = resourceLoader.getResource(dataLocation + csvFile);
        if (!resource.exists()) {
            log.warn("Seed data file not found: {}", resource);
            return List.of();
        }
        try (InputStream in = resource.getInputStream()) {
            return parseCsv(in);
        } catch (IOException e) {
            log.error("Failed to read seed data file {}", csvFile, e);
            return List.of();
        }
    }

    private void logVerification(Session session) {
        try {
            long nodes = session.run("MATCH (n) RETURN count(n) AS c").single().get("c").asLong();
            long relationships = session.run("MATCH ()-[r]->() RETURN count(r) AS c").single().get("c").asLong();
            log.info("Graph now contains {} nodes and {} relationships", nodes, relationships);
        } catch (Exception e) {
            log.warn("Could not run seed verification query: {}", e.getMessage());
        }
    }

    private static List<Map<String, String>> parseCsv(InputStream in) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return rows;
            }
            List<String> headers = splitCsvLine(headerLine);
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                List<String> values = splitCsvLine(line);
                Map<String, String> row = new LinkedHashMap<>();
                for (int i = 0; i < headers.size(); i++) {
                    row.put(headers.get(i), i < values.size() ? values.get(i) : "");
                }
                rows.add(row);
            }
        }
        return rows;
    }

    private static List<String> splitCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        current.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == ',') {
                fields.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());
        return fields;
    }
}
