import React from 'react';

/**
 * Hero Component
 * Renders the hero banner with background wedding lights image,
 * romantic gradient overlay, trusted badge, headings, and CTA buttons.
 */
function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨</span> India's Most Trusted Matrimonial Network
          </div>

          <h1 className="hero-title">Meet. Connect. Find Your Sanjog.</h1>
          <p className="hero-subtitle">
            Where meaningful connections turn into beautiful beginnings. Where hearts unite and families celebrate eternal beginnings.
          </p>

          <div
            className="hero-actions"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <a href="register.html" className="btn btn-primary btn-lg">
              Create Profile
            </a>
            <a
              href="find-matches.html"
              className="btn btn-white btn-lg"
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: 'var(--primary)'
              }}
            >
              Explore Matches
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
