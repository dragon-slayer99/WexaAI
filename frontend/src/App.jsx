import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Search from './pages/search/Search.jsx';
import ArtistDetails from './pages/artist/ArtistDetails.jsx';
import Pathfinder from './pages/pathfinder/Pathfinder.jsx';
import PlaylistDetails from './pages/playlistdetails/PlaylistDetails.jsx';
import './App.css';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickAction = (path) => {
    navigate(path);
  };

  return (
    <main className="home-container">
      <div className="content-wrapper">
        <span className="overline">Graph Intelligence</span>
        <h1 className="headline">CongoDB Explorer</h1>
        <p className="subtitle">
          Traverse relationships, find shortest paths, and discover connected music graph data.
        </p>

        {/* Updated Form with Button */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Type an artist name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-search-submit">
            SEARCH
          </button>
        </form>

        <div className="quick-actions-container">
          <p className="quick-actions-label">Quick Graph Traversals</p>
          <div className="button-group">
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleQuickAction('/path?source=Loud Lights&target=Silent Night')}
            >
              Find path between Soul and Lights
            </button>

            <button
              type="button"
              className="btn-outline-light"
              onClick={() => handleQuickAction('/artist/A58')}
            >
              Similar to The Maiden
            </button>

            <button
              type="button"
              className="btn-outline-light"
              onClick={() => handleQuickAction('/playlists/Classic Emotional Vibes Vol. 6/similar')}
            >
              Explore Connected Playlists
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/artist/:id" element={<ArtistDetails />} />
      <Route path="/path" element={<Pathfinder />} />
      <Route path="/playlists/:name/similar" element={<PlaylistDetails />} />
    </Routes>
  );
}