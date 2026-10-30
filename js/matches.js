/**
 * =============================================================================
 * Sanjog Matrimonial - Matches Module (js/matches.js)
 * =============================================================================
 * Responsibility:
 * Defines the database of verified matrimonial profiles and handles search filtering,
 * criteria selection (gender, age group, location, profession), profile card
 * actions, and sending interest invitations.
 * =============================================================================
 */

(function () {
  'use strict';

  // Database of 6 verified profiles
  const PROFILES = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      age: 24,
      gender: 'bride',
      ageGroup: '21-25',
      location: 'delhi',
      cityDisplay: 'Delhi NCR, India',
      profession: 'doctor',
      professionDisplay: 'Doctor (MBBS, MD - Apollo)',
      image: 'images/profile1.jpg',
      bio: 'Compassionate physician with deep family values. Loves reading, classical dance, and weekend family get-togethers.',
      degree: 'MBBS, MD (Medicine)',
      college: 'Maulana Azad Medical College',
      hospital: 'Apollo Hospitals, New Delhi',
      income: '₹18 - 22 Lakhs / Year',
      gotra: 'Vatsa',
      manglik: 'Non-Manglik',
      diet: 'Pure Vegetarian / Teetotaler',
      religion: 'Hindu / Brahmin (Gaur)',
      dob: '14 April 2001',
      profileId: 'SJ-89241',
      gallery: [
        'images/profile1_gallery1.jpg',
        'images/profile1_gallery2.jpg',
        'images/profile1_gallery3.jpg',
        'images/profile1_gallery4.jpg'
      ]
    },
    {
      id: '2',
      name: 'Rohan Mehta',
      age: 27,
      gender: 'groom',
      ageGroup: '26-30',
      location: 'gurugram',
      cityDisplay: 'Gurugram, Haryana',
      profession: 'software',
      professionDisplay: 'Software Architect (Google)',
      image: 'images/profile2.jpg',
      bio: 'Tech enthusiast who loves trekking, reading philosophy, and spending Sunday mornings cooking with family.',
      degree: 'B.Tech & M.Tech (Computer Science)',
      college: 'IIT Delhi',
      hospital: 'Google India, Gurugram',
      income: '₹45 - 55 Lakhs / Year',
      gotra: 'Kashyap',
      manglik: 'Non-Manglik',
      diet: 'Vegetarian',
      religion: 'Hindu / Bania (Aggarwal)',
      dob: '22 October 1998',
      profileId: 'SJ-74192'
    },
    {
      id: '3',
      name: 'Ananya Joshi',
      age: 25,
      gender: 'bride',
      ageGroup: '21-25',
      location: 'mumbai',
      cityDisplay: 'Mumbai, Maharashtra',
      profession: 'design',
      professionDisplay: 'Lead UI/UX Designer',
      image: 'images/profile3.jpg',
      bio: 'Creative soul with passion for design thinking, classical music, art exhibitions, and exploring quaint heritage cafes.',
      degree: 'Master of Design (M.Des)',
      college: 'National Institute of Design (NID)',
      hospital: 'Fintech Studio, BKC Mumbai',
      income: '₹22 - 26 Lakhs / Year',
      gotra: 'Bharadwaja',
      manglik: 'Non-Manglik',
      diet: 'Eggetarian',
      religion: 'Hindu / Brahmin (Chitpavan)',
      dob: '05 March 2000',
      profileId: 'SJ-92384'
    },
    {
      id: '4',
      name: 'Vikramaditya Verma',
      age: 29,
      gender: 'groom',
      ageGroup: '26-30',
      location: 'ahmedabad',
      cityDisplay: 'Ahmedabad, Gujarat',
      profession: 'ca',
      professionDisplay: 'Chartered Accountant & Partner',
      image: 'images/profile4.jpg',
      bio: 'Senior partner at established audit firm. Respectful of traditions, badminton player, and avid reader of history.',
      degree: 'Chartered Accountant (FCA), B.Com (Hons)',
      college: 'ICAI / St. Xavier\'s College',
      hospital: 'Verma & Associates CA Firm',
      income: '₹35 - 40 Lakhs / Year',
      gotra: 'Shandilya',
      manglik: 'Anshik Manglik',
      diet: 'Strict Vegetarian',
      religion: 'Hindu / Kshatriya (Verma)',
      dob: '18 July 1996',
      profileId: 'SJ-61849'
    },
    {
      id: '5',
      name: 'Meera Singhania',
      age: 24,
      gender: 'bride',
      ageGroup: '21-25',
      location: 'chandigarh',
      cityDisplay: 'Chandigarh / Patiala',
      profession: 'psychologist',
      professionDisplay: 'Clinical Psychologist (M.Sc)',
      image: 'images/profile5.jpg',
      bio: 'Warm-hearted counselor dedicated to child wellness. Enjoys poetry, culinary arts, yoga, and warm family dinners.',
      degree: 'M.Sc Clinical Psychology',
      college: 'Panjab University',
      hospital: 'Fortis Hospital, Mohali',
      income: '₹14 - 18 Lakhs / Year',
      gotra: 'Garg',
      manglik: 'Non-Manglik',
      diet: 'Vegetarian',
      religion: 'Hindu / Arora',
      dob: '29 November 2001',
      profileId: 'SJ-83210'
    },
    {
      id: '6',
      name: 'Siddharth Malhotra',
      age: 28,
      gender: 'groom',
      ageGroup: '26-30',
      location: 'hyderabad',
      cityDisplay: 'Hyderabad, Telangana',
      profession: 'ai',
      professionDisplay: 'AI Research Scientist (Microsoft)',
      image: 'images/profile6.jpg',
      bio: 'AI researcher working on generative models. Marathon runner, coffee connoisseur, deeply rooted in family traditions.',
      degree: 'MS in Artificial Intelligence',
      college: 'IIIT Hyderabad',
      hospital: 'Microsoft R&D, Hyderabad',
      income: '₹50 - 60 Lakhs / Year',
      gotra: 'Vashishta',
      manglik: 'Non-Manglik',
      diet: 'Vegetarian',
      religion: 'Hindu / Khatri',
      dob: '11 August 1997',
      profileId: 'SJ-59021'
    }
  ];

  /**
   * Sends an express-interest invitation to a candidate
   * @param {string} id - Profile ID
   * @param {string} name - Candidate Full Name
   * @param {HTMLElement} btn - Button element clicked
   */
  function sendInterest(id, name, btn) {
    const interests = window.getInterests ? window.getInterests() : [];
    if (!interests.includes(id)) {
      interests.push(id);
      if (window.setInterests) window.setInterests(interests);
    }
    if (btn) {
      btn.classList.add('btn-interest-sent');
      btn.innerHTML = '✔ Interest Sent';
    }
    if (typeof window.showToast === 'function') {
      window.showToast(`Interest invitation sent to ${name}! 💌`, 'success');
    }
  }

  /**
   * Initializes Find Matches page: connects filters, card actions, and counter
   */
  function initFindMatchesPage() {
    const filterForm = document.querySelector('.filter-form');
    const profileGrid = document.querySelector('.profile-grid');
    if (!profileGrid) return;

    const countParagraph = document.querySelector('main.main-content p strong');
    const favs = window.getFavorites ? window.getFavorites() : [];
    const interests = window.getInterests ? window.getInterests() : [];

    const userProfile = window.getUserProfile ? window.getUserProfile() : null;
    if (userProfile) {
      const banner = document.querySelector('main.main-content div[style*="justify-content: space-between"]');
      if (banner) {
        const sortedText = banner.querySelector('span[style*="color: var(--primary)"]');
        if (sortedText) {
          const firstName = userProfile.fullname.split(' ')[0] || 'You';
          sortedText.textContent = `Personalized for ${firstName} • Matches & Preferences`;
        }
      }
    }

    // Attach dataset metadata to existing static cards in order
    const cards = Array.from(profileGrid.querySelectorAll('.profile-card'));
    cards.forEach((card, i) => {
      const profile = PROFILES[i];
      if (profile) {
        card.setAttribute('data-id', profile.id);
        card.setAttribute('data-gender', profile.gender);
        card.setAttribute('data-age-group', profile.ageGroup);
        card.setAttribute('data-location', profile.location);
        card.setAttribute('data-profession', profile.profession);

        // Heart favorite button
        const favBtn = card.querySelector('.profile-fav-btn');
        if (favBtn) {
          if (favs.includes(profile.id)) {
            favBtn.classList.add('active');
            favBtn.innerHTML = '❤️';
          }
          favBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.toggleFavorite === 'function') {
              window.toggleFavorite(profile.id, profile.name, favBtn);
            }
          });
        }

        // Send interest button
        const interestBtn = card.querySelector('.profile-card-actions .btn-primary');
        if (interestBtn) {
          if (interests.includes(profile.id)) {
            interestBtn.classList.add('btn-interest-sent');
            interestBtn.innerHTML = '✔ Interest Sent';
          }
          interestBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendInterest(profile.id, profile.name, interestBtn);
          });
        }

        // View profile button
        const viewBtn = card.querySelector('.profile-card-actions .btn-outline');
        if (viewBtn) {
          viewBtn.setAttribute('href', `profile.html?id=${profile.id}`);
        }
      }
    });

    // Filter logic
    function applyFilters() {
      const gender = (document.getElementById('f-gender')?.value || 'all').toLowerCase();
      const age = (document.getElementById('f-age')?.value || 'all').toLowerCase();
      const city = (document.getElementById('f-city')?.value || 'all').toLowerCase();
      const prof = (document.getElementById('f-prof')?.value || 'all').toLowerCase();

      let visibleCount = 0;
      cards.forEach(card => {
        const cGender = card.getAttribute('data-gender') || '';
        const cAge = card.getAttribute('data-age-group') || '';
        const cCity = card.getAttribute('data-location') || '';
        const cProf = card.getAttribute('data-profession') || '';

        const matchGender = (gender === 'all' || cGender === gender);
        const matchAge = (age === 'all' || cAge === age);
        const matchCity = (city === 'all' || cCity === city);
        const matchProf = (prof === 'all' || cProf === prof);

        if (matchGender && matchAge && matchCity && matchProf) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countParagraph) {
        countParagraph.textContent = `${visibleCount} Verified Matches`;
      }

      // Check empty state
      let emptyMsg = document.getElementById('no-matches-msg');
      if (visibleCount === 0) {
        if (!emptyMsg) {
          emptyMsg = document.createElement('div');
          emptyMsg.id = 'no-matches-msg';
          emptyMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);';
          emptyMsg.innerHTML = `
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--text-dark); margin-bottom: 8px;">No Profiles Match Your Selected Filters</h3>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Try expanding your age, location, or profession preferences to discover more matches.</p>
            <button type="button" id="btn-reset-filters" class="btn btn-primary btn-sm">Reset All Filters</button>
          `;
          profileGrid.appendChild(emptyMsg);
          document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
        }
        emptyMsg.style.display = 'block';
      } else if (emptyMsg) {
        emptyMsg.style.display = 'none';
      }
    }

    function resetFilters() {
      const g = document.getElementById('f-gender'); if (g) g.value = 'all';
      const a = document.getElementById('f-age'); if (a) a.value = 'all';
      const c = document.getElementById('f-city'); if (c) c.value = 'all';
      const p = document.getElementById('f-prof'); if (p) p.value = 'all';
      applyFilters();
      if (typeof window.showToast === 'function') {
        window.showToast('Filters cleared. Showing all verified profiles.', 'info');
      }
    }

    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
        if (typeof window.showToast === 'function') {
          window.showToast('Profile criteria updated.', 'info');
        }
      });

      // Filter button click
      const filterBtn = filterForm.querySelector('button');
      if (filterBtn) {
        filterBtn.addEventListener('click', (e) => {
          e.preventDefault();
          applyFilters();
          if (typeof window.showToast === 'function') {
            window.showToast('Search filters applied!', 'info');
          }
        });
      }

      // Live change filters
      filterForm.querySelectorAll('select').forEach(sel => {
        sel.addEventListener('change', applyFilters);
      });
    }
  }

  // Export to window
  window.PROFILES = PROFILES;
  window.sendInterest = (id, name, btn) => {
    if (!name) {
      const p = PROFILES.find(item => item.id == id);
      name = p ? p.name : 'Candidate';
    }
    if (!btn) {
      btn = document.querySelector(`.profile-card[data-id="${id}"] .profile-card-actions .btn-primary`) || document.querySelector('button[onclick*="sendInterest"]');
    }
    sendInterest(String(id), name, btn);
  };
  window.initFindMatchesPage = initFindMatchesPage;

})();
