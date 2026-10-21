/**
 * =============================================================================
 * Sanjog Matrimonial - Favorites / Shortlist Module (js/favorites.js)
 * =============================================================================
 * Responsibility:
 * Handles adding and removing candidate profiles from the user's personal shortlist,
 * toggling the heart indicator, persisting choices in localStorage, and dynamically
 * rendering the shortlisted profiles on shortlisted.html / favourite.html.
 * =============================================================================
 */

(function () {
  'use strict';

  /**
   * Toggles candidate profile in user's shortlist (favorites)
   * @param {string} id - Profile ID
   * @param {string} name - Candidate Full Name
   * @param {HTMLElement} btn - Heart button element
   */
  function toggleFavorite(id, name, btn) {
    const favs = window.getFavorites ? window.getFavorites() : [];
    const idx = favs.indexOf(id);
    if (idx > -1) {
      favs.splice(idx, 1);
      if (window.setFavorites) window.setFavorites(favs);
      if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '❤';
        btn.style.color = '';
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Removed ${name} from your Shortlist`, 'info');
      }
    } else {
      favs.push(id);
      if (window.setFavorites) window.setFavorites(favs);
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '❤️';
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Added ${name} to your Shortlist! ❤`, 'success');
      }
    }
  }

  /**
   * Initializes Shortlisted / Favorites page: dynamically renders saved candidate cards
   */
  function initShortlistedPage() {
    const favGrid = document.querySelector('.favorites-grid');
    if (!favGrid) return;

    const countTag = document.querySelector('main.main-content p strong');

    function renderFavorites() {
      const currentFavs = window.getFavorites ? window.getFavorites() : [];
      favGrid.innerHTML = '';

      if (countTag) {
        countTag.textContent = `${currentFavs.length} Profiles Saved`;
      }

      if (currentFavs.length === 0) {
        favGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
            <div style="font-size: 2.8rem; margin-bottom: 12px;">🤍</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: var(--text-dark); margin-bottom: 8px;">No Shortlisted Profiles Yet</h3>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 24px; max-width: 460px; margin-left: auto; margin-right: auto;">
              Explore verified matches and click the heart icon (❤) on any profile to save them here for quick family review.
            </p>
            <a href="find-matches.html" class="btn btn-primary btn-sm">Browse Verified Matches →</a>
          </div>
        `;
        return;
      }

      const profiles = window.PROFILES || [];
      const matchedProfiles = profiles.filter(p => currentFavs.includes(p.id));
      matchedProfiles.forEach(profile => {
        const card = document.createElement('article');
        card.className = 'profile-card';
        card.innerHTML = `
          <div class="profile-card-img-wrap">
            <img src="${profile.image}" alt="${profile.name}" class="profile-card-img">
            <div class="profile-card-badges">
              <span class="badge badge-verified">✔ Verified</span>
              <span class="badge badge-premium">Premium</span>
            </div>
            <button type="button" class="profile-fav-btn active" title="Remove from Shortlist" style="border:none; cursor:pointer;">❤️</button>
          </div>
          <div class="profile-card-body">
            <div class="profile-name-row">
              <h3 class="profile-name">${profile.name}</h3>
              <span class="profile-age">${profile.age} Yrs</span>
            </div>
            <div class="profile-location">📍 ${profile.cityDisplay}</div>
            <div class="profile-profession">💼 ${profile.professionDisplay}</div>
            <p style="font-size: 12.5px; color: var(--text-muted); margin: 8px 0;">
              Status: <span style="color: var(--primary); font-weight: 600;">Shortlisted by You</span>
            </p>
            <div class="profile-card-actions" style="margin-top: auto; display: flex; gap: 8px;">
              <a href="messages.html" class="btn btn-primary btn-sm" style="flex: 1; text-align: center;">💬 Send Note</a>
              <a href="profile.html?id=${profile.id}" class="btn btn-outline btn-sm" style="flex: 1; text-align: center;">View Biodata</a>
            </div>
          </div>
        `;

        // Remove from favorite button
        const rmBtn = card.querySelector('.profile-fav-btn');
        rmBtn.addEventListener('click', (e) => {
          e.preventDefault();
          toggleFavorite(profile.id, profile.name, null);
          renderFavorites();
        });

        favGrid.appendChild(card);
      });
    }

    renderFavorites();
  }

  // Export to window
  window.toggleFavorite = (id, name, btn) => {
    if (!name) {
      const p = (window.PROFILES || []).find(item => item.id == id);
      name = p ? p.name : 'Candidate';
    }
    if (!btn) {
      btn = document.querySelector(`.profile-card[data-id="${id}"] .profile-fav-btn`) || document.getElementById('profile-shortlist-btn');
    }
    toggleFavorite(String(id), name, btn);
  };
  window.initShortlistedPage = initShortlistedPage;

})();
