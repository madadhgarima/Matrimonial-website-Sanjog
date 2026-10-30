import React from 'react';

/**
 * Feature card items matching the original homepage section
 */
const features = [
  {
    icon: '✔',
    title: '100% Verified Profiles',
    desc: 'Every profile goes through rigorous mobile number, government ID, and education credential verification.'
  },
  {
    icon: '🔒',
    title: 'Complete Privacy',
    desc: 'Control who views your photo, contact details, and horoscope with granular privacy preferences.'
  },
  {
    icon: '🎯',
    title: 'Handcrafted Matches',
    desc: 'Smart compatibility matching based on lifestyle habits, community values, education, and career aspirations.'
  },
  {
    icon: '👥',
    title: 'Dedicated Matchmakers',
    desc: 'Our experienced relationship advisors support families at every step, from first introduction to family meetings.'
  }
];

/**
 * WhyChooseUs Component
 * Renders the "Why Choose Sanjog" value proposition section with feature cards.
 */
function WhyChooseUs() {
  return (
    <section className="section section-light">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Purity & Trust</span>
          <h2 className="section-title">Why Choose Sanjog</h2>
          <p className="section-description">
            We combine traditional family sensibilities with cutting-edge matchmaking technology to help you find your lifelong companion.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon-box">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
