import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
import './PlaylistDetails.css';

export default function PlaylistDetails() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [similarPlaylists, setSimilarPlaylists] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the manual search input
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!name) return;

    setLoading(true);
    setError(null);
    setSearchInput(''); // Clear input on route change

    const encodedName = encodeURIComponent(name);

    // Fetch both Similar Playlists and the Target Playlist's Songs
    Promise.all([
      fetch(`${API_BASE}/api/playlist/${encodedName}/similar`).then(res => {
        if (!res.ok) throw new Error("Could not fetch connected playlists.");
        if (res.status === 204) return []; 
        return res.json();
      }),
      fetch(`${API_BASE}/api/playlist/${encodedName}/songs`).then(res => {
        if (!res.ok) return []; // Fallback if songs endpoint fails
        if (res.status === 204) return [];
        return res.json();
      })
    ])
      .then(([similarData, songsData]) => {
        setSimilarPlaylists(similarData);
        setPlaylistSongs(songsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to compute playlist overlap at this time.");
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return (
      <main className="playlist-page">
        <div className="playlist-container">
          <p className="loading-text">Analyzing song intersections...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="playlist-page">
      <div className="playlist-container">
        
        <span className="overline">Graph Discovery</span>
        
        {/* Source Playlist Hero Block */}
        <div className="source-playlist-hero">
          <p className="source-label">Current Playlist</p>
          <h1 className="source-title">{name}</h1>
          <p className="source-meta">
            Showing similar playlists based on exact song overlap in the graph network.
          </p>
        </div>

        {/* Navigation Search Form */}
        <div className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search another playlist..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button 
            className="btn-search"
            onClick={() => {
              if (searchInput.trim()) {
                navigate(`/playlists/${encodeURIComponent(searchInput.trim())}/similar`);
              }
            }}
          >
            EXPLORE
          </button>
        </div>

        {/* Current Playlist Tracks */}
        <h2 className="section-header">Tracklist ({playlistSongs.length})</h2>
        <div className="song-list">
          {playlistSongs.length === 0 ? (
            <div className="song-row">
              <span style={{ color: "rgba(255,255,255,0.5)" }}>No tracks available in this playlist.</span>
            </div>
          ) : (
            playlistSongs.map((song, index) => (
              <div key={index} className="song-row">
                <span>{song.songName || song}</span>
                <span style={{ opacity: 0.5 }}>→</span>
              </div>
            ))
          )}
        </div>

        {/* Similar Playlists Grid */}
        <h2 className="section-header">Connected Playlists</h2>
        {error ? (
          <p className="error-text">{error}</p>
        ) : similarPlaylists.length === 0 ? (
          <p className="loading-text">No overlapping playlists found in the graph.</p>
        ) : (
          <div className="playlist-grid">
            {similarPlaylists.map((playlist, index) => (
              <div 
                key={index} 
                className="playlist-card"
                onClick={() => navigate(`/playlists/${encodeURIComponent(playlist.playlistName)}/similar`)}
                role="button"
                tabIndex={0}
              >
                {/* Sunlight Yellow pill for the overlap count */}
                <div className="overlap-badge">
                  {playlist.sharedSongCnt} Shared Tracks
                </div>
                
                <h3 className="playlist-name">{playlist.playlistName}</h3>
                <p className="playlist-mood">Mood: {playlist.mood}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}