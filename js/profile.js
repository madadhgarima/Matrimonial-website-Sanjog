/**
 * =============================================================================
 * Sanjog Matrimonial - Profile Display Module (js/profile.js)
 * =============================================================================
 * Responsibility:
 * Renders detailed matrimonial biodata on my-profile.html and candidate profiles
 * on profile.html. Populates personal details, horoscope/manglik status, education,
 * career, family background, lifestyle preferences, partner expectations, and
 * verified photo gallery. Also provides direct photo upload functionality.
 * =============================================================================
 */

(function () {
  'use strict';

  /**
   * Helper function to format an ISO date string into a user-friendly format
   * @param {string} dateStr
   * @returns {string} Formatted date (e.g. "14 Apr 2001")
   */
  function formatDate(dateStr) {
    if (!dateStr) return 'Not Specified';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Allows the logged-in member to upload and add new photos to their verified album
   */
  function triggerPhotoUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 5 * 1024 * 1024) {
          if (typeof window.showToast === 'function') {
            window.showToast('Image is too large. Please select a photo under 5MB.', 'info');
          }
          return;
        }
        const reader = new FileReader();
        reader.onload = function (evt) {
          const photoData = evt.target.result;
          const userProfile = window.getUserProfile ? window.getUserProfile() : null;
          if (userProfile) {
            if (!userProfile.gallery) userProfile.gallery = [];
            userProfile.gallery.unshift(photoData);
            if (window.setUserProfile) window.setUserProfile(userProfile);
            const photoCountEl = document.getElementById('user-photo-count');
            if (photoCountEl) {
              const total = 1 + userProfile.gallery.length;
              photoCountEl.textContent = `📷 ${total} Photos`;
            }
          }

          const galleryGrid = document.getElementById('user-gallery-grid') || document.querySelector('section div[style*="grid-template-columns"]');
          if (galleryGrid) {
            const newPhotoCard = document.createElement('div');
            newPhotoCard.className = 'user-uploaded-photo';
            newPhotoCard.style.cssText = 'position: relative; border-radius: var(--radius-md); overflow: hidden; border: 1.5px solid var(--border); box-shadow: var(--shadow-sm); aspect-ratio: 1/1;';
            newPhotoCard.innerHTML = `
              <img src="${photoData}" alt="Newly uploaded photo" style="width: 100%; height: 100%; object-fit: cover;">
              <span style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.75)); color: #fff; font-size: 11.5px; padding: 16px 8px 6px; text-align: center;">New Upload</span>
            `;
            galleryGrid.prepend(newPhotoCard);
            if (typeof window.showToast === 'function') {
              window.showToast('Photo uploaded and saved to your album! 📷', 'success');
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
    fileInput.click();
  }

  /**
   * Initializes profile viewing page (my-profile.html or profile.html)
   */
  function initProfilePage() {
    const isMyProfilePage = window.location.pathname.includes('my-profile.html');
    const isCandidateProfilePage = window.location.pathname.includes('profile.html');
    if (!isMyProfilePage && !isCandidateProfilePage) {
      return; // Do not run on register.html, signup.html, index.html, etc.
    }

    const params = new URLSearchParams(window.location.search);
    const profileId = params.get('id');

    // Case A: User's own Profile Page (my-profile.html or profile.html?id=me)
    if (isMyProfilePage || profileId === 'me') {
      const noProfileState = document.getElementById('no-profile-state');
      const userProfileView = document.getElementById('user-profile-view');
      const userProfile = window.getUserProfile ? window.getUserProfile() : null;

      if (!userProfile) {
        if (noProfileState) noProfileState.style.display = 'block';
        if (userProfileView) userProfileView.style.display = 'none';
        return;
      }

      if (noProfileState) noProfileState.style.display = 'none';
      if (userProfileView) userProfileView.style.display = 'block';

      // Safe DOM updates using textContent
      const avatarEl = document.getElementById('user-avatar');
      if (avatarEl) {
        avatarEl.src = userProfile.photo || (userProfile.gender === 'male' ? 'images/profile2.jpg' : 'images/profile1.jpg');
        avatarEl.alt = userProfile.fullname;
      }

      const fullnameEl = document.getElementById('user-fullname');
      if (fullnameEl) fullnameEl.textContent = userProfile.fullname;

      const profileIdEl = document.getElementById('user-profile-id');
      if (profileIdEl) profileIdEl.textContent = 'Profile ID: ' + userProfile.profileId;

      const headlineEl = document.getElementById('user-headline');
      if (headlineEl) {
        const genderLabel = userProfile.gender === 'female' ? 'Female (Bride)' : 'Male (Groom)';
        headlineEl.textContent = `${userProfile.age} Yrs • ${genderLabel} • ${userProfile.religion} - ${userProfile.caste}`;
      }

      const bioEl = document.getElementById('user-bio');
      if (bioEl) bioEl.textContent = userProfile.about;

      const photoCountEl = document.getElementById('user-photo-count');
      const totalPhotos = 1 + (userProfile.gallery ? userProfile.gallery.length : 0);
      if (photoCountEl) photoCountEl.textContent = `📷 ${totalPhotos} Photo${totalPhotos > 1 ? 's' : ''}`;

      // Gallery binding
      const primaryGalleryImg = document.getElementById('primary-gallery-img');
      if (primaryGalleryImg) primaryGalleryImg.src = userProfile.photo || (userProfile.gender === 'male' ? 'images/profile2.jpg' : 'images/profile1.jpg');

      const albumTitle = document.getElementById('user-album-title');
      if (albumTitle) {
        const firstName = userProfile.fullname.split(' ')[0] || 'Your';
        albumTitle.textContent = `📷 ${firstName}'s Verified Photo Album (${totalPhotos} Photos)`;
      }

      const galleryGrid = document.getElementById('user-gallery-grid');
      if (galleryGrid) {
        galleryGrid.querySelectorAll('.user-uploaded-photo').forEach(el => el.remove());
        if (userProfile.gallery && userProfile.gallery.length > 0) {
          userProfile.gallery.forEach((photoUrl, idx) => {
            const card = document.createElement('div');
            card.className = 'user-uploaded-photo';
            card.style.cssText = 'position: relative; border-radius: var(--radius-md); overflow: hidden; border: 1.5px solid var(--border); box-shadow: var(--shadow-sm); aspect-ratio: 1/1;';
            card.innerHTML = `
              <img src="${photoUrl}" alt="Gallery Photo ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;">
              <span style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.75)); color: #fff; font-size: 11px; padding: 14px 6px 6px; text-align: center;">Photo ${idx + 2}</span>
            `;
            galleryGrid.appendChild(card);
          });
        }
      }

      // Biodata table values (safely updating textContent, or value if form input)
      const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
          if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = val || '';
          } else {
            el.textContent = val || '—';
          }
        }
      };

      setField('bio-age-dob', `${userProfile.age} Yrs (${formatDate(userProfile.dob)})`);
      setField('bio-religion-caste', `${userProfile.religion} / ${userProfile.caste}`);
      setField('bio-manglik', userProfile.manglik);
      setField('bio-diet', userProfile.diet);
      setField('bio-city', userProfile.location);
      setField('bio-degree', userProfile.degree);
      setField('bio-occupation', userProfile.occupation);
      setField('bio-income', userProfile.income);
      setField('bio-work-city', userProfile.location);
      setField('bio-hobbies', userProfile.hobbies);
      setField('bio-for', userProfile.profileFor ? (userProfile.profileFor.charAt(0).toUpperCase() + userProfile.profileFor.slice(1)) : 'Self');
      setField('bio-phone', userProfile.phone);
      setField('bio-email', userProfile.email);
      setField('bio-native', userProfile.location);

      // Partner Preferences display
      const prefs = userProfile.partnerPreferences || {};

      const prefGender = userProfile.gender === 'female' ? 'Groom (Male)' : 'Bride (Female)';
      setField('pref-looking-for', prefGender);

      // Age range
      const prefAgeStr = (prefs.ageMin && prefs.ageMax)
        ? `${prefs.ageMin} to ${prefs.ageMax} Yrs`
        : (prefs.ageMin ? `${prefs.ageMin}+ Yrs` : `${Math.max(18, userProfile.age - 2)} to ${userProfile.age + 4} Yrs`);
      setField('pref-age', prefAgeStr);
      setField('pref-view-age', prefAgeStr);

      // Height
      let prefHeightStr = 'No preference';
      if (prefs.heightMin && prefs.heightMax) {
        prefHeightStr = `${prefs.heightMin} to ${prefs.heightMax}`;
      } else if (prefs.heightMin) {
        prefHeightStr = `Min: ${prefs.heightMin}`;
      } else if (prefs.heightMax) {
        prefHeightStr = `Max: ${prefs.heightMax}`;
      }
      setField('pref-view-height', prefHeightStr);

      // Location
      const prefLocStr = (prefs.location && prefs.location.trim() && prefs.location !== 'No Preference')
        ? prefs.location
        : 'No preference';
      setField('pref-cities', prefLocStr !== 'No preference' ? prefLocStr : `${userProfile.location || 'Any City'}`);
      setField('pref-view-location', prefLocStr);

      // Education
      const prefEduStr = (prefs.education && prefs.education.trim() && prefs.education !== 'No Preference')
        ? prefs.education
        : 'No preference';
      setField('pref-summary-education', prefEduStr);
      setField('pref-view-education', prefEduStr);

      // Profession
      const prefProfStr = (prefs.profession && prefs.profession.trim() && prefs.profession !== 'No Preference')
        ? prefs.profession
        : 'No preference';
      setField('pref-summary-profession', prefProfStr);
      setField('pref-view-profession', prefProfStr);

      // Religion
      const prefRelStr = (prefs.religion && prefs.religion.trim() && prefs.religion !== 'No Preference')
        ? prefs.religion
        : 'No preference';
      setField('pref-view-religion', prefRelStr);

      // Caste / Community
      const prefCasteStr = (prefs.caste && prefs.caste.trim() && prefs.caste !== 'No Preference')
        ? prefs.caste
        : 'No preference';
      setField('pref-view-caste', prefCasteStr);

      // Summary for Card 4
      const relCasteSummary = `${prefRelStr !== 'No preference' ? prefRelStr : 'Open to All'} / ${prefCasteStr !== 'No preference' ? prefCasteStr : 'Any Community'}`;
      setField('pref-religion-caste', relCasteSummary);

      // Lifestyle: Diet
      const prefDietStr = (prefs.diet && prefs.diet.trim() && prefs.diet !== 'No Preference')
        ? prefs.diet
        : 'No preference';
      setField('pref-view-diet', prefDietStr);

      // Lifestyle: Drinking
      const prefDrinkStr = (prefs.drinking && prefs.drinking.trim() && prefs.drinking !== 'No Preference')
        ? prefs.drinking
        : 'No preference';
      setField('pref-view-drinking', prefDrinkStr);

      // Lifestyle: Smoking
      const prefSmokeStr = (prefs.smoking && prefs.smoking.trim() && prefs.smoking !== 'No Preference')
        ? prefs.smoking
        : 'No preference';
      setField('pref-view-smoking', prefSmokeStr);

      // Other Requirements
      const prefOtherStr = (prefs.other && prefs.other.trim())
        ? prefs.other
        : 'Not specified';
      setField('pref-view-other', prefOtherStr);

      // About Ideal Partner
      const prefAboutStr = (prefs.aboutPartner && prefs.aboutPartner.trim())
        ? prefs.aboutPartner
        : 'Not specified';
      setField('pref-view-about', prefAboutStr);

      return;
    }

    // Case B: Candidate profile view (profile.html?id=1 to 6)
    const profiles = window.PROFILES || [];
    const profile = profiles.find(p => p.id === (profileId || '1'));
    if (profile && document.querySelector('.profile-details-grid, main')) {
      const nameHeading = document.querySelector('h2');
      if (nameHeading) nameHeading.textContent = profile.name;

      const profileIdTag = document.querySelector('.badge-verified');
      if (profileIdTag) profileIdTag.textContent = `Profile ID: ${profile.profileId}`;

      const avatarImg = document.querySelector('img[alt*="Dr. Priya Sharma"], img[alt*="Avatar"], img.profile-avatar-lg, #user-avatar');
      if (avatarImg) {
        avatarImg.src = profile.image;
        avatarImg.alt = profile.name;
      }

      const infoP = document.querySelector('p[style*="font-size: 15px"]');
      if (infoP) {
        infoP.textContent = `${profile.age} Yrs • ${profile.gender === 'bride' ? "5'5\"" : "5'11\""} • ${profile.religion}`;
      }

      const bioP = document.querySelector('p[style*="color: var(--text-muted); font-size: 14px"]');
      if (bioP) {
        bioP.textContent = profile.bio;
      }

      // Update table fields if present
      const tableCells = document.querySelectorAll('.biodata-table td, table td');
      tableCells.forEach(td => {
        const text = td.textContent.toLowerCase();
        if (text.includes('occupation') && td.nextElementSibling) td.nextElementSibling.textContent = profile.professionDisplay;
        if (text.includes('current city') && td.nextElementSibling) td.nextElementSibling.textContent = profile.cityDisplay;
        if (text.includes('annual income') && td.nextElementSibling) td.nextElementSibling.textContent = profile.income;
        if (text.includes('gotra') && td.nextElementSibling) td.nextElementSibling.textContent = profile.gotra;
        if (text.includes('manglik') && td.nextElementSibling) td.nextElementSibling.textContent = profile.manglik;
        if (text.includes('diet') && td.nextElementSibling) td.nextElementSibling.textContent = profile.diet;
        if (text.includes('highest degree') && td.nextElementSibling) td.nextElementSibling.textContent = profile.degree;
      });
    }

    // Express Interest button on profile header
    const expressBtn = document.querySelector('a.btn-primary[href*="messages"], button[onclick*="sendInterest"]');
    if (expressBtn && expressBtn.textContent.includes('Interest')) {
      expressBtn.addEventListener('click', (e) => {
        e.preventDefault();
        expressBtn.classList.add('btn-interest-sent');
        expressBtn.textContent = '✔ Interest Expressed';
        if (typeof window.showToast === 'function') {
          window.showToast('Interest expressed! Matchmaker will notify the family. 💌', 'success');
        }
      });
    }

    // Shortlist button on profile header
    const shortlistBtn = document.getElementById('profile-shortlist-btn') || document.querySelector('a.btn-secondary[href*="shortlisted"]');
    if (shortlistBtn && shortlistBtn.textContent.includes('Shortlist')) {
      shortlistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const pId = profile ? profile.id : '1';
        const pName = profile ? profile.name : 'Dr. Priya Sharma';
        if (typeof window.toggleFavorite === 'function') {
          window.toggleFavorite(pId, pName, null);
        }
        shortlistBtn.textContent = '❤️ Shortlisted';
      });
    }
  }

  // Export to window
  window.formatDate = formatDate;
  window.triggerPhotoUpload = triggerPhotoUpload;
  window.initProfilePage = initProfilePage;

})();
