import React from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import WhyChooseUs from './components/WhyChooseUs.jsx';

/**
 * Home Component
 * Coordinates the full homepage layout with Navbar, Hero banner, and WhyChooseUs sections.
 */
function Home() {
  return (
    <div className="sanjog-homepage">
      <Navbar />
      <Hero />
      <WhyChooseUs />
    </div>
  );
}

export default Home;
