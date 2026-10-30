/**
 * =============================================================================
 * Sanjog Matrimonial - Profile Display Module (js/profile.js)
 * =============================================================================
 * Responsibility:
 * Renders detailed matrimonial biodata on my-profile.html and candidate profiles
 * on profile.html. Populates personal details, horoscope/manglik status, education,
 * career, family background, lifestyle preferences, partner expectations, and
 * verified photo gallery.
 *
 * Key Capabilities:
 * - Displays a neutral default avatar (images/default-avatar.svg) when a user has
 *   not uploaded a custom photo (never defaults to a random person).
 * - Automatically replaces default avatar when the user uploads their own photo.
 * - Displays each candidate's own verified photo and corresponding gallery on profile.html.
 * =============================================================================
 */

(function () {
  'use strict';

  const DEFAULT_AVATAR = 'images/default-avatar.svg';

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
   * Centralized renderer for user's photo album on my-profile.html.
   * Ensures the primary photo appears once with ★ Primary, and each distinct gallery photo appears once.
   * Eliminates duplicate photos completely.
   */
  function renderUserAlbum(userProfile) {
    if (!userProfile) return;
    const userPhoto = (userProfile.photo && userProfile.photo.trim()) ? userProfile.photo : DEFAULT_AVATAR;
    const hasCustomPhoto = userPhoto !== DEFAULT_AVATAR;

    // Filter gallery to ensure no nulls and NO duplicate of userPhoto or DEFAULT_AVATAR
    const cleanGallery = [];
    const seen = new Set([userPhoto, DEFAULT_AVATAR]);
    if (Array.isArray(userProfile.gallery)) {
      userProfile.gallery.forEach(url => {
        if (url && !seen.has(url)) {
          seen.add(url);
          cleanGallery.push(url);
        }
      });
    }
    userProfile.gallery = cleanGallery;

    const totalPhotos = hasCustomPhoto ? (1 + cleanGallery.length) : 0;

    // 1. Update avatar on profile card
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) {
      avatarEl.src = userPhoto;
      avatarEl.alt = userProfile.fullname ? `${userProfile.fullname}'s Profile Photo` : 'User Profile Photo';
    }

    // 2. Update photo count badge
    const photoCountEl = document.getElementById('user-photo-count');
    if (photoCountEl) {
      photoCountEl.textContent = hasCustomPhoto ? `📷 ${totalPhotos} Photo${totalPhotos > 1 ? 's' : ''}` : '📷 Default Avatar';
    }

    // 3. Update album title
    const albumTitle = document.getElementById('user-album-title');
    if (albumTitle) {
      const firstName = (userProfile.fullname || 'Your').split(' ')[0];
      albumTitle.textContent = hasCustomPhoto
        ? `📷 ${firstName}'s Verified Photo Album (${totalPhotos} Photo${totalPhotos > 1 ? 's' : ''})`
        : `📷 ${firstName}'s Photo Album (Default Avatar)`;
    }

    // 4. Update primary photo card
    const primaryGalleryImg = document.getElementById('primary-gallery-img');
    if (primaryGalleryImg) {
      primaryGalleryImg.src = userPhoto;
      primaryGalleryImg.alt = userProfile.fullname ? `${userProfile.fullname}'s Primary Photo` : 'Primary Photo';
    }

    // 5. Update gallery grid: Remove old secondary cards and append clean secondary photos
    const galleryGrid = document.getElementById('user-gallery-grid');
    if (galleryGrid) {
      galleryGrid.querySelectorAll('.user-uploaded-photo').forEach(el => el.remove());
      cleanGallery.forEach((photoUrl, idx) => {
        const card = document.createElement('div');
        card.className = 'user-uploaded-photo biodata-gallery-item';
        card.innerHTML = `
          <img src="${photoUrl}" alt="Gallery Photo ${idx + 2}" class="biodata-gallery-img">
          <span class="biodata-gallery-caption">Photo ${idx + 2}</span>
        `;
        galleryGrid.appendChild(card);
      });
    }
  }

  /**
   * Allows the logged-in member to upload and add new photos to their verified album.
   * If user has no custom photo, uploaded photo becomes the primary photo.
   * If user already has a primary photo, uploaded photo is added to gallery once.
   * Exactly one photo entry is created per upload.
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
          let userProfile = window.getUserProfile ? window.getUserProfile() : null;
          const activeUser = window.getActiveUser ? window.getActiveUser() : null;

          if (!userProfile && activeUser) {
            userProfile = {
              profileId: 'SJ-' + Math.floor(10000 + Math.random() * 90000),
              fullname: activeUser.name || 'Member',
              email: activeUser.email || '',
              username: activeUser.username || ''
            };
          }

          if (userProfile) {
            const currentPhoto = userProfile.photo || '';
            const isCurrentDefault = !currentPhoto || currentPhoto === DEFAULT_AVATAR;

            if (isCurrentDefault) {
              // First upload: set as primary photo (appears once in primary card with ★ Primary)
              userProfile.photo = photoData;
              userProfile.gallery = (userProfile.gallery || []).filter(p => p && p !== photoData && p !== DEFAULT_AVATAR);
            } else if (currentPhoto === photoData) {
              // Already primary, no duplicate needed
            } else {
              // Additional photo: add once to gallery
              if (!Array.isArray(userProfile.gallery)) userProfile.gallery = [];
              if (!userProfile.gallery.includes(photoData)) {
                userProfile.gallery.push(photoData);
              }
            }

            if (typeof window.setUserProfile === 'function') {
              window.setUserProfile(userProfile);
            }

            // Centralized render: ensures exactly one card per photo, no duplicates in DOM
            renderUserAlbum(userProfile);

            if (typeof window.showToast === 'function') {
              window.showToast('Photo uploaded successfully! 📷', 'success');
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

    // =========================================================================
    // CASE A: User's own Profile Page (my-profile.html or profile.html?id=me)
    // =========================================================================
    if (isMyProfilePage || (isCandidateProfilePage && profileId === 'me')) {
      const noProfileState = document.getElementById('no-profile-state');
      const userProfileView = document.getElementById('user-profile-view');
      let userProfile = window.getUserProfile ? window.getUserProfile() : null;
      const activeUser = window.getActiveUser ? window.getActiveUser() : null;

      if (!userProfile && activeUser) {
        userProfile = {
          profileId: 'SJ-' + Math.floor(10000 + Math.random() * 90000),
          fullname: activeUser.name || 'Member',
          email: activeUser.email || '',
          username: activeUser.username || ''
        };
      }

      if (!userProfile) {
        if (noProfileState) noProfileState.style.display = 'block';
        if (userProfileView) userProfileView.style.display = 'none';
        return;
      }

      if (noProfileState) noProfileState.style.display = 'none';
      if (userProfileView) userProfileView.style.display = 'block';

      // Full Name & Profile ID
      const fullnameEl = document.getElementById('user-fullname');
      if (fullnameEl) fullnameEl.textContent = userProfile.fullname || 'Your Profile';

      const profileIdEl = document.getElementById('user-profile-id');
      if (profileIdEl) profileIdEl.textContent = 'Profile ID: ' + (userProfile.profileId || 'SJ-USER');

      // 1. Profession, Gender & Headline: Do NOT assume gender or display Male/Female if not selected by user
      const professionEl = document.getElementById('user-profession');
      if (professionEl) {
        professionEl.textContent = userProfile.occupation || 'Profession: Not specified';
      }

      const headlineEl = document.getElementById('user-headline');
      if (headlineEl) {
        let genderLabel = 'Not specified';
        const g = (userProfile.gender || '').toLowerCase().trim();
        if (g === 'male' || g === 'groom') {
          genderLabel = 'Male (Groom)';
        } else if (g === 'female' || g === 'bride') {
          genderLabel = 'Female (Bride)';
        }

        const agePart = userProfile.age ? `${userProfile.age} Yrs` : 'Age: Not specified';
        const religionPart = userProfile.religion
          ? `${userProfile.religion}${userProfile.caste ? ' - ' + userProfile.caste : ''}`
          : 'Community: Not specified';

        headlineEl.textContent = `${agePart} • ${genderLabel} • ${religionPart}`;
      }

      const bioEl = document.getElementById('user-bio');
      if (bioEl) bioEl.textContent = userProfile.about || 'Not specified';

      // 2. Verified Photo Album: Centralized rendering (no duplicate photos)
      renderUserAlbum(userProfile);

      // 3. Biodata table values: Display 'Not specified' for any missing fields
      const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
          if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = val || '';
          } else {
            el.textContent = (val && String(val).trim()) ? val : 'Not specified';
          }
        }
      };

      const ageDobVal = (userProfile.age && userProfile.dob)
        ? `${userProfile.age} Yrs (${formatDate(userProfile.dob)})`
        : (userProfile.age ? `${userProfile.age} Yrs` : 'Not specified');
      setField('bio-age-dob', ageDobVal);

      const relCasteVal = (userProfile.religion && userProfile.caste)
        ? `${userProfile.religion} / ${userProfile.caste}`
        : (userProfile.religion ? userProfile.religion : 'Not specified');
      setField('bio-religion-caste', relCasteVal);

      setField('bio-manglik', userProfile.manglik);
      setField('bio-diet', userProfile.diet);
      setField('bio-city', userProfile.location);
      setField('bio-degree', userProfile.degree);
      setField('bio-occupation', userProfile.occupation);
      setField('bio-income', userProfile.income);
      setField('bio-work-city', userProfile.location);
      setField('bio-hobbies', userProfile.hobbies);
      setField('bio-for', userProfile.profileFor ? (userProfile.profileFor.charAt(0).toUpperCase() + userProfile.profileFor.slice(1)) : 'Not specified');
      setField('bio-phone', userProfile.phone);
      setField('bio-email', userProfile.email);
      setField('bio-native', userProfile.location);

      // 4. Partner Preferences display: Do not assume gender or fake values
      const prefs = userProfile.partnerPreferences || {};

      let prefGender = 'Not specified';
      const gUser = (userProfile.gender || '').toLowerCase().trim();
      if (gUser === 'female' || gUser === 'bride') {
        prefGender = 'Groom (Male)';
      } else if (gUser === 'male' || gUser === 'groom') {
        prefGender = 'Bride (Female)';
      }
      setField('pref-looking-for', prefGender);

      const prefAgeStr = (prefs.ageMin && prefs.ageMax)
        ? `${prefs.ageMin} to ${prefs.ageMax} Yrs`
        : (prefs.ageMin ? `${prefs.ageMin}+ Yrs` : 'Not specified');
      setField('pref-age', prefAgeStr);
      setField('pref-view-age', prefAgeStr);

      let prefHeightStr = 'Not specified';
      if (prefs.heightMin && prefs.heightMax) {
        prefHeightStr = `${prefs.heightMin} to ${prefs.heightMax}`;
      } else if (prefs.heightMin) {
        prefHeightStr = `Min: ${prefs.heightMin}`;
      } else if (prefs.heightMax) {
        prefHeightStr = `Max: ${prefs.heightMax}`;
      }
      setField('pref-view-height', prefHeightStr);

      setField('pref-cities', prefs.location || 'Not specified');
      setField('pref-view-location', prefs.location || 'Not specified');

      setField('pref-summary-education', prefs.education || 'Not specified');
      setField('pref-view-education', prefs.education || 'Not specified');

      setField('pref-summary-profession', prefs.profession || 'Not specified');
      setField('pref-view-profession', prefs.profession || 'Not specified');

      setField('pref-view-religion', prefs.religion || 'Not specified');
      setField('pref-view-caste', prefs.caste || 'Not specified');

      const relCasteSummary = (prefs.religion && prefs.caste)
        ? `${prefs.religion} / ${prefs.caste}`
        : (prefs.religion ? prefs.religion : 'Not specified');
      setField('pref-religion-caste', relCasteSummary);

      setField('pref-view-diet', prefs.diet || 'Not specified');
      setField('pref-view-drinking', prefs.drinking || 'Not specified');
      setField('pref-view-smoking', prefs.smoking || 'Not specified');
      setField('pref-view-other', prefs.other || 'Not specified');
      setField('pref-view-about', prefs.aboutPartner || 'Not specified');

      return;
    }

    // =========================================================================
    // CASE B: Candidate profile view (profile.html?id=1 to 6 or registered profile ID)
    // =========================================================================
    const profiles = window.PROFILES || [];
    let profile = null;

    if (profileId) {
      profile = profiles.find(p => String(p.id) === String(profileId));

      // Also check if profile matches active user or registered users in localStorage
      if (!profile) {
        const activeUserProfile = window.getUserProfile ? window.getUserProfile() : null;
        if (activeUserProfile && activeUserProfile.profileId === profileId) {
          profile = activeUserProfile;
        } else {
          const accounts = window.getAccounts ? window.getAccounts() : [];
          for (const acc of accounts) {
            const raw = localStorage.getItem((window.PROFILE_KEY_PREFIX || 'sanjog_profile_') + acc.email.toLowerCase().trim());
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (parsed && (parsed.profileId === profileId || String(parsed.id) === String(profileId))) {
                  profile = parsed;
                  break;
                }
              } catch (e) {}
            }
          }
        }
      }
    }

    // Default to candidate 1 if not found
    if (!profile) {
      profile = profiles[0] || {};
    }

    // Retrieve candidate photo or neutral default avatar (never default to a girl's photo)
    const candidatePhoto = (profile.image && profile.image.trim()) || (profile.photo && profile.photo.trim()) || DEFAULT_AVATAR;

    // 1. Candidate Avatar & Name
    const avatarImg = document.getElementById('candidate-avatar') || document.querySelector('img[alt*="Dr. Priya Sharma"], img[alt*="Avatar"], img.profile-avatar-lg, #user-avatar');
    if (avatarImg) {
      avatarImg.src = candidatePhoto;
      avatarImg.alt = profile.fullname || profile.name || 'Candidate Photo';
    }

    const nameHeading = document.getElementById('candidate-fullname') || document.querySelector('h2');
    if (nameHeading) {
      nameHeading.textContent = profile.fullname || profile.name || 'Candidate Profile';
      document.title = `${profile.fullname || profile.name || 'Candidate'} - Sanjog Matrimonial Profile`;
    }

    const profileIdTag = document.getElementById('candidate-profile-id') || document.querySelector('.badge-verified');
    if (profileIdTag) {
      profileIdTag.textContent = `Profile ID: ${profile.profileId || ('SJ-' + profile.id)}`;
    }

    // 2. Gender & Headline (Using saved profile data, not assuming from photo filename)
    const gender = (profile.gender || '').toLowerCase();
    const isGroom = gender === 'groom' || gender === 'male';
    const genderLabel = isGroom ? 'Male (Groom)' : 'Female (Bride)';
    const heightLabel = isGroom ? "5'11\" (180 cm)" : "5'5\" (165 cm)";

    const professionEl = document.getElementById('candidate-profession');
    if (professionEl) {
      professionEl.textContent = profile.professionDisplay || profile.occupation || 'Professional / Healthcare Specialist';
    }

    const headlineEl = document.getElementById('candidate-headline') || document.querySelector('p[style*="font-size: 15px"]');
    if (headlineEl) {
      headlineEl.textContent = `${profile.age || '—'} Yrs • ${heightLabel} • ${profile.religion || 'Hindu'}${profile.caste ? ' - ' + profile.caste : ''}`;
    }

    const bioEl = document.getElementById('candidate-bio') || document.querySelector('p[style*="color: var(--text-muted); font-size: 14px"]');
    if (bioEl) {
      bioEl.textContent = profile.about || profile.bio || 'Compassionate and family-oriented candidate seeking a compatible life partner.';
    }

    // 3. Photo Album & Gallery: Display ONLY candidate's own photos!
    const galleryGrid = document.getElementById('candidate-gallery-grid');
    const albumTitle = document.getElementById('candidate-album-title');
    const photoCountEl = document.getElementById('candidate-photo-count');

    const photosList = [];
    photosList.push({
      url: candidatePhoto,
      label: candidatePhoto === DEFAULT_AVATAR ? 'Default Avatar' : 'Primary Portrait',
      isPrimary: true
    });

    if (profile.gallery && Array.isArray(profile.gallery) && profile.gallery.length > 0) {
      profile.gallery.forEach((url, i) => {
        if (url && url !== candidatePhoto) {
          photosList.push({
            url: url,
            label: `Photo ${i + 2}`,
            isPrimary: false
          });
        }
      });
    }

    const totalCount = photosList.length;
    if (photoCountEl) {
      photoCountEl.textContent = candidatePhoto === DEFAULT_AVATAR ? '📷 Default Avatar' : `📷 ${totalCount} Photo${totalCount > 1 ? 's' : ''}`;
    }

    if (albumTitle) {
      const firstName = (profile.fullname || profile.name || 'Candidate').split(' ')[0];
      albumTitle.textContent = `📷 ${firstName}'s Verified Photo Album (${totalCount} Photo${totalCount > 1 ? 's' : ''})`;
    }

    if (galleryGrid) {
      galleryGrid.innerHTML = '';
      photosList.forEach(item => {
        const card = document.createElement('div');
        card.className = `biodata-gallery-item ${item.isPrimary ? 'primary' : ''}`;
        card.innerHTML = `
          <img src="${item.url}" alt="${profile.fullname || profile.name} - ${item.label}" class="biodata-gallery-img">
          ${item.isPrimary ? '<span class="biodata-gallery-tag">★ Primary</span>' : ''}
          <span class="biodata-gallery-caption">${item.label}</span>
        `;
        galleryGrid.appendChild(card);
      });
    }

    // 4. Action Buttons (Express Interest & Shortlist)
    const expressBtn = document.getElementById('candidate-express-btn') || document.querySelector('button[onclick*="sendInterest"]');
    const shortlistBtn = document.getElementById('candidate-shortlist-btn') || document.getElementById('profile-shortlist-btn');
    const messageBtn = document.getElementById('candidate-message-btn') || document.querySelector('a.btn-outline[href*="messages"]');

    if (messageBtn) {
      messageBtn.href = `messages.html?contact=${encodeURIComponent(profile.fullname || profile.name || '')}`;
    }

    const favs = window.getFavorites ? window.getFavorites() : [];
    const isFav = favs.includes(String(profile.id));

    if (shortlistBtn) {
      if (isFav) {
        shortlistBtn.classList.add('active');
        shortlistBtn.textContent = '❤️ Shortlisted';
      } else {
        shortlistBtn.classList.remove('active');
        shortlistBtn.textContent = '❤ Shortlist';
      }
      shortlistBtn.onclick = (e) => {
        e.preventDefault();
        if (typeof window.toggleFavorite === 'function') {
          window.toggleFavorite(String(profile.id), profile.fullname || profile.name, shortlistBtn);
        }
      };
    }

    const interests = window.getInterests ? window.getInterests() : [];
    const hasInterest = interests.includes(String(profile.id));

    if (expressBtn) {
      if (hasInterest) {
        expressBtn.classList.add('btn-interest-sent');
        expressBtn.textContent = '✔ Interest Expressed';
      } else {
        expressBtn.classList.remove('btn-interest-sent');
        expressBtn.textContent = '💌 Express Interest';
      }
      expressBtn.onclick = (e) => {
        e.preventDefault();
        if (typeof window.sendInterest === 'function') {
          window.sendInterest(String(profile.id), profile.fullname || profile.name, expressBtn);
        }
      };
    }

    // 5. Update Biodata Tables
    const setField = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    };

    setField('cand-age-dob', `${profile.age || '—'} Yrs (${profile.dob || 'Not specified'})`);
    setField('cand-religion-caste', profile.religion ? `${profile.religion}${profile.caste ? ' / ' + profile.caste : ''}` : 'Hindu');
    setField('cand-gotra', profile.gotra || 'Kashyap');
    setField('cand-manglik', profile.manglik || 'Non-Manglik');
    setField('cand-diet', profile.diet || 'Vegetarian');
    setField('cand-city', profile.cityDisplay || profile.location || 'Delhi NCR');

    setField('cand-degree', profile.degree || 'Bachelor\'s Degree');
    setField('cand-college', profile.college || 'Premier University');
    setField('cand-occupation', profile.professionDisplay || profile.occupation || 'Professional');
    setField('cand-hospital', profile.hospital || profile.company || profile.organization || (isGroom ? 'Corporate Headquarters' : 'Apollo Hospitals'));
    setField('cand-income', profile.income || '₹15 - 25 Lakhs / Year');
    setField('cand-work-city', profile.cityDisplay || profile.location || 'Delhi NCR');

    setField('cand-father', isGroom ? 'Senior Executive / Business Director' : 'Retd. Government Officer (Class 1)');
    setField('cand-mother', isGroom ? 'Homemaker / Family Pillar' : 'Professor of Literature');
    setField('cand-siblings', '1 Sibling (Well settled)');
    setField('cand-family-values', 'Moderate & Traditional Family Values');
    setField('cand-native', profile.cityDisplay || profile.location || 'India');

    setField('cand-pref-age', isGroom ? '23 to 27 Yrs' : '26 to 31 Yrs');
    setField('cand-pref-height', isGroom ? "5'2\" to 5'7\"" : "5'8\" to 6'2\"");
    setField('cand-pref-education', 'Graduate / Post-Graduate');
    setField('cand-pref-cities', profile.cityDisplay || profile.location || 'Delhi NCR');
    setField('cand-pref-values', isGroom ? 'Educated, family-oriented, understanding companion' : 'Ambitious, respectful, cultured professional');
  }

  // Export to window
  window.DEFAULT_AVATAR = DEFAULT_AVATAR;
  window.formatDate = formatDate;
  window.renderUserAlbum = renderUserAlbum;
  window.triggerPhotoUpload = triggerPhotoUpload;
  window.initProfilePage = initProfilePage;

})();
