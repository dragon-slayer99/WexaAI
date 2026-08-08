import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../../config';
import './Search.css';

export default function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Call the Spring Boot Search Endpoint
        fetch(`${API_BASE}/api/artists?name=${encodeURIComponent(query)}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch results');
                return res.json();
            })
            .then((data) => {
                setResults(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Unable to search at this time.");
                setLoading(false);
            });
    }, [query]);

    const handleResultClick = (artistId) => {
        // Navigate to the details page using the unique artistId
        navigate(`/artist/${encodeURIComponent(artistId)}`);
    };

    return (
        <div className="search-page">
            {/* Top Navigation Bar */}

            <main className="search-container">
                <h1 className="search-header">
                    Results for <span className="search-query-text">"{query}"</span>
                </h1>

                {loading ? (
                    <p className="no-results">Searching graph database...</p>
                ) : error ? (
                    <p className="no-results" style={{ color: '#be6464' }}>{error}</p>
                ) : results.length === 0 ? (
                    <p className="no-results">No artists found matching your query.</p>
                ) : (
                    <div className="results-grid">
                        {results.map((artist) => (
                            <div
                                key={artist.artistId}
                                className="result-card"
                                onClick={() => handleResultClick(artist.artistId)}
                                role="button"
                                tabIndex={0}
                            >
                                <h2 className="result-name">{artist.name}</h2>
                                <p className="result-meta">
                                    {artist.popularity?.toLocaleString() || 0} Monthly Listeners
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
