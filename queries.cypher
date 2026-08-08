// Find all artist
MATCH (a:artist)
WHERE a.name = $name
RETURN a;

// Similar Artists

MATCH (a:artist)-[:SIMILAR_TO]->(similar)
WHERE a.name = $name
RETURN a;

// Recommendation

MATCH (a:artist)-[:SIMILAR_TO]->(similar)-[:CREATED]->(song)
WHERE a.name = $name
RETURN song
LIMIT 10;

// Connect finding between all the artists in the DB

MATCH p = SHORTESTPATH ((a:artist)-[*..15]-(b:artist))
WHERE a.name = $source AND b.name = $target
RETURN p;