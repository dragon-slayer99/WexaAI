import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    // Helper to check if a link is active for styling
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header>
            <nav className="nav-bar">
                {/* Left: Logo */}
                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    CONGODB EXPLORER
                </Link>

                {/* Centre: Desktop Navigation */}
                <div className="nav-center">
                    <Link to="/artist/A7" className={`nav-link ${location.pathname.startsWith('/artist') ? 'active' : ''}`}>
                        Artists
                    </Link>
                    <Link to="playlists/Classic%20Emotional%20Vibes%20Vol.%206/similar" className={`nav-link ${location.pathname.startsWith('/playlists') ? 'active' : ''}`}>
                        Playlists
                    </Link>
                    <Link to="/path" className={`nav-link ${isActive('/path')}`}>
                        Pathfinder
                    </Link>
                </div>

                {/* Right: Mobile Hamburger Icon */}
                <button
                    className="mobile-menu-btn"
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    {/* Simple CSS Hamburger or 'X' */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                        {isMobileMenuOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </button>
            </nav>

            {/* Mobile Dropdown Panel */}
            <div className={`mobile-dropdown ${isMobileMenuOpen ? 'open' : ''}`}>
                <Link to="/artist/Linkin%20Park" className={`nav-link ${location.pathname.startsWith('/artist') ? 'active' : ''}`} onClick={closeMenu}>
                    Artists
                </Link>
                <Link to="playlists/Classic%20Emotional%20Vibes%20Vol.%206/similar" className={`nav-link ${location.pathname.startsWith('/playlists') ? 'active' : ''}`} onClick={closeMenu}>
                    Playlists
                </Link>
                <Link to="/path" className={`nav-link ${isActive('/path')}`} onClick={closeMenu}>
                    Pathfinder
                </Link>
            </div>
        </header>
    );
}