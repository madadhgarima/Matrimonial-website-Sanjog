import React, { useState, useEffect } from 'react';

/**
 * Navbar Component
 * Renders the top navigation bar with brand logo, navigation links,
 * mobile menu toggle, and dynamic login / user profile action buttons.
 */
function Navbar() {
  const [activeUser, setActiveUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check if a user is currently logged in via existing authentication system
    if (typeof window !== 'undefined' && typeof window.getActiveUser === 'function') {
      setActiveUser(window.getActiveUser());
    } else {
      try {
        const stored = localStorage.getItem('sanjog_active_user') || sessionStorage.getItem('sanjog_session_user');
        if (stored) {
          setActiveUser(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Error reading user session:', err);
      }
    }
  }, []);

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined' && typeof window.logoutUser === 'function') {
      window.logoutUser();
    } else {
      localStorage.removeItem('sanjog_active_user');
      sessionStorage.removeItem('sanjog_session_user');
      window.location.reload();
    }
    setActiveUser(null);
  };

  const firstName = activeUser?.name ? activeUser.name.split(' ')[0] : 'My Profile';

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Sanjog Brand Identity (Logo Image + Romantic Serif Font) */}
        <a href="index.html" className="brand-logo" aria-label="Sanjog Matrimonial Homepage">
          <img src="loginimages/logo.jpeg" alt="Sanjog Logo" className="brand-logo-img" />
          <div className="logo-text">
            <span className="logo-main">Sanjog</span>
            <span className="logo-tagline">Choose Your Forever</span>
          </div>
        </a>

        {/* Pure CSS Mobile Hamburger Checkbox Toggle (Zero JavaScript) */}
        <input
          type="checkbox"
          id="nav-toggle"
          className="nav-toggle"
          checked={isMenuOpen}
          onChange={(e) => setIsMenuOpen(e.target.checked)}
        />
        <label htmlFor="nav-toggle" className="nav-toggle-label" aria-label="Toggle Navigation">
          <span></span>
        </label>

        {/* Main Navigation Links (Clickable Working Tabs) */}
        <nav className="nav-menu">
          <a href="index.html" className="nav-link active" onClick={() => setIsMenuOpen(false)}>Home</a>
          <a href="find-matches.html" className="nav-link" onClick={() => setIsMenuOpen(false)}>Find Matches</a>
          <a href="my-matches.html" className="nav-link" onClick={() => setIsMenuOpen(false)}>My Matches</a>
          <a href="shortlisted.html" className="nav-link" onClick={() => setIsMenuOpen(false)}>Favorites</a>
          <a href="messages.html" className="nav-link" onClick={() => setIsMenuOpen(false)}>Messages</a>
          <a href="notifications.html" className="nav-link" onClick={() => setIsMenuOpen(false)}>Notifications</a>
          <a href="my-profile.html" className="nav-link" onClick={() => setIsMenuOpen(false)}>Profile</a>
          <a href="about.html" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</a>
          <a href="contact.html" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="nav-actions">
          {activeUser ? (
            <>
              <a
                href="my-profile.html"
                className="btn btn-outline btn-sm nav-user-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title={`Signed in as ${activeUser.name} (${activeUser.email || ''})`}
              >
                <span>👤</span>
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {firstName}
                </span>
              </a>
              <button
                type="button"
                className="btn btn-primary btn-sm nav-logout-btn"
                onClick={handleLogout}
                style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Logout</span> <span>🚪</span>
              </button>
            </>
          ) : (
            <>
              <a href="login.html" className="btn btn-outline btn-sm">Login</a>
              <a href="signup.html" className="btn btn-primary btn-sm">Register</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
