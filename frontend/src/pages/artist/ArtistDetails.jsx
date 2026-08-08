import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
import './ArtistDetails.css';

export default function ArtistDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [artist, setArtist] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        let isActive = true;

        const loadArtist = async () => {
            setLoading(true);
            setError(null);

            try {
                const encodedId = encodeURIComponent(id);

                const detailsResponse = await fetch(`${API_BASE}/api/artists/${encodedId}`);

                if (!detailsResponse.ok) {
                    throw new Error('Artist details not found');
                }

                const detailsData = await detailsResponse.json();
                const artistName = detailsData?.name;

                if (!artistName) {
                    throw new Error('Artist name not found');
                }

                const recommendationsResponse = await fetch(
                    `${API_BASE}/api/artists/${encodeURIComponent(artistName)}/recommendations`
                );

                const recommendationsData =
                    recommendationsResponse.status === 204 || !recommendationsResponse.ok
                        ? []
                        : await recommendationsResponse.json();

                if (!isActive) {
                    return;
                }

                setArtist(detailsData);
                setRecommendations(recommendationsData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                if (!isActive) {
                    return;
                }

                setError('Unable to retrieve graph nodes for this artist.');
                setLoading(false);
            }
        };

        loadArtist();

        return () => {
            isActive = false;
        };
    }, [id]);

    if (loading) {
        return (
            <main className="artist-page">
                <div className="layout-grid">
                    <p className="loading-text">Traversing graph relationships...</p>
                </div>
            </main>
        );
    }

    if (error || !artist) {
        return (
            <main className="artist-page">
                <div className="layout-grid">
                    <p className="error-text">{error || "Artist node not found."}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="artist-page">
            <div className="layout-grid">

                {/* Left Pane: Artist Identity & Multi-Hop Network */}
                <section className="left-pane">
                    <span className="overline">Node Data</span>
                    <h1 className="artist-name">{artist.name}</h1>

                    <p className="popularity">
                        Popularity Score: {artist.popularity || 0}
                    </p>

                    <div className="pill-row">
                        {artist.genres && artist.genres.map((genre, index) => (
                            <span key={index} className="genre-pill">
                                {genre}
                            </span>
                        ))}
                        {(!artist.genres || artist.genres.length === 0) && (
                            <span className="genre-pill" style={{ opacity: 0.5 }}>No genres mapped</span>
                        )}
                    </div>

                    <h2 className="section-title" style={{ marginTop: '32px' }}>Graph Network</h2>
                    <p className="popularity" style={{ fontSize: '16px', marginBottom: '24px' }}>
                        Similar artists identified via shared genres and attributes.
                    </p>

                    <div className="recs-grid">
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className="rec-card"
                                onClick={() => navigate(`/artist/${encodeURIComponent(rec.artistId)}`)}
                                role="button"
                                tabIndex={0}
                            >
                                <h3 className="rec-name">{rec.name}</h3>
                                <p className="rec-meta">Popularity: {rec.popularity}</p>
                            </div>
                        ))}
                        {recommendations.length === 0 && (
                            <p className="loading-text">No similar nodes found in the network.</p>
                        )}
                    </div>
                </section>

                {/* Right Pane: Discography */}
                <section className="right-pane">
                    <h2 className="section-title">Discography</h2>
                    <div className="song-list">
                        {/* Note: Adhering strictly to the capitalized 'Songs' array from the API schema */}
                        {artist.Songs && artist.Songs.map((song, index) => (
                            <div key={index} className="song-row">
                                <span>{song}</span>
                                <span style={{ opacity: 0.5 }}>→</span>
                            </div>
                        ))}

                        {(!artist.Songs || artist.Songs.length === 0) && (
                            <div className="song-row">
                                <span style={{ color: "rgba(255,255,255,0.5)" }}>No connected tracks</span>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
}