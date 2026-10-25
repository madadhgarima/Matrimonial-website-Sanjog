/**
 * =============================================================================
 * Sanjog Matrimonial - Partner Preferences & Profile Creation Module
 * (js/partner-preferences.js)
 * =============================================================================
 * Responsibility:
 * Controls the Create Profile / Edit Profile form on register.html.
 * Manages both Section 1: Personal Details and Section 2: Partner Preferences
 * (preferred age, height, location, profession, education, religion, caste,
 * diet, drinking, smoking, and partner expectations). Handles photo preview,
 * pre-filling authenticated user data, form validation, and persistence.
 * =============================================================================
 */

(function () {
  'use strict';

  /**
   * Initializes the registration / create profile / edit profile form
   */
  function initRegistrationPage() {
    const regForm = document.getElementById('register-form');
    if (!regForm) return;

    const isEdit = new URLSearchParams(window.location.search).get('edit') === '1';
    let uploadedPhotoBase64 = null;

    // Photo input live preview listener
    const photoInput = document.getElementById('r-photo');
    const photoPreview = document.getElementById('photo-preview');

    if (photoInput) {
      photoInput.addEventListener('change', () => {
        if (photoInput.files && photoInput.files[0]) {
          const file = photoInput.files[0];
          if (file.size > 5 * 1024 * 1024) {
            if (typeof window.showToast === 'function') {
              window.showToast('Photo is too large. Please select an image under 5MB.', 'info');
            }
            return;
          }
          const reader = new FileReader();
          reader.onload = (evt) => {
            uploadedPhotoBase64 = evt.target.result;
            if (photoPreview) {
              photoPreview.src = uploadedPhotoBase64;
            }
            if (typeof window.showToast === 'function') {
              window.showToast('Profile photo preview updated! 📷', 'info');
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Gender change listener to update default avatar if user has not uploaded custom photo
    const genderSelect = document.getElementById('r-gender');
    if (genderSelect && photoPreview) {
      genderSelect.addEventListener('change', () => {
        if (!uploadedPhotoBase64) {
          photoPreview.src = genderSelect.value === 'male' ? 'images/profile2.jpg' : 'images/profile1.jpg';
        }
      });
    }

    // Pre-populate if existing profile or active user
    const existingProfile = window.getUserProfile ? window.getUserProfile() : null;
    const activeUser = window.getActiveUser ? window.getActiveUser() : null;
    const heading = document.querySelector('.main-content h1');
    const subtitle = document.querySelector('.main-content p[style*="font-size: 14px"]');
    const submitBtn = regForm.querySelector('button[type="submit"], button.btn-primary');

    // Helper to set form values
    const setValue = (id, val) => {
      const el = document.getElementById(id);
      if (!el || val === undefined || val === null) return;
      if (el.tagName === 'SELECT') {
        el.value = val;
        // If direct value match failed, try flexible match against option values and texts
        if (el.value !== val) {
          const searchStr = String(val).toLowerCase().trim();
          for (let i = 0; i < el.options.length; i++) {
            const opt = el.options[i];
            const optVal = opt.value.toLowerCase().trim();
            const optText = opt.text.toLowerCase().trim();
            if (optVal === searchStr || optText === searchStr ||
                (searchStr.length > 3 && (optVal.includes(searchStr) || searchStr.includes(optVal)))) {
              el.selectedIndex = i;
              break;
            }
          }
        }
      } else {
        el.value = val;
      }
    };

    if (existingProfile && (isEdit || existingProfile.dob || existingProfile.degree)) {
      if (heading) heading.textContent = 'Edit Your Sanjog Profile';
      if (subtitle) subtitle.textContent = 'Update your biodata details, partner expectations, and verified photo.';
      if (submitBtn) submitBtn.textContent = 'Save Changes & Update Profile ✔';

      setValue('r-profile-for', existingProfile.profileFor || 'myself');
      setValue('r-fullname', existingProfile.fullname || (activeUser ? activeUser.name : ''));
      setValue('r-email', existingProfile.email || (activeUser ? activeUser.email : ''));
      setValue('r-phone', existingProfile.phone || '');
      setValue('r-gender', existingProfile.gender || 'female');
      setValue('r-dob', existingProfile.dob || '');
      setValue('r-religion', existingProfile.religionKey || 'hindu');
      setValue('r-caste', existingProfile.caste || '');
      setValue('r-manglik', existingProfile.manglikKey || 'non-manglik');
      setValue('r-degree', existingProfile.degree || '');
      setValue('r-occupation', existingProfile.occupation || '');
      setValue('r-income', existingProfile.incomeKey || '15-25');
      setValue('r-location', existingProfile.location || '');
      setValue('r-hobbies', existingProfile.hobbies || '');
      setValue('r-diet', existingProfile.diet || 'Vegetarian');
      setValue('r-about', existingProfile.about || '');

      // Pre-fill Partner Preferences if available
      if (existingProfile.partnerPreferences) {
        const pp = existingProfile.partnerPreferences;
        setValue('pref-age-min', pp.ageMin !== undefined ? pp.ageMin : '21');
        setValue('pref-age-max', pp.ageMax !== undefined ? pp.ageMax : '30');
        setValue('pref-height-min', pp.heightMin || '');
        setValue('pref-height-max', pp.heightMax || '');
        setValue('pref-location', pp.location === 'No Preference' ? '' : (pp.location || ''));
        setValue('pref-profession', pp.profession || 'No Preference');
        setValue('pref-education', pp.education || 'No Preference');
        setValue('pref-religion', pp.religion || 'No Preference');
        setValue('pref-caste', pp.caste === 'No Preference' ? '' : (pp.caste || ''));
        setValue('pref-diet', pp.diet || 'No Preference');
        setValue('pref-drinking', pp.drinking || 'No Preference');
        setValue('pref-smoking', pp.smoking || 'No Preference');
        setValue('pref-about-partner', pp.aboutPartner || '');
        setValue('pref-other', pp.other || '');
      }

      // Smooth scroll if landed via #partner-preferences edit link
      if (window.location.hash === '#partner-preferences') {
        setTimeout(() => {
          const prefAnchor = document.getElementById('partner-preferences');
          if (prefAnchor) prefAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      }

      if (existingProfile.photo) {
        uploadedPhotoBase64 = existingProfile.photo;
        if (photoPreview) photoPreview.src = existingProfile.photo;
      }

      // Make password optional during edit
      const passInput = document.getElementById('r-password');
      if (passInput) {
        passInput.removeAttribute('required');
        passInput.placeholder = 'Leave blank to keep existing password';
      }

      const termsCheck = document.getElementById('r-terms');
      if (termsCheck) termsCheck.checked = true;
    } else if (activeUser) {
      // New profile for authenticated user: prefill account details
      setValue('r-fullname', activeUser.name);
      setValue('r-email', activeUser.email);
    }

    // Handle Form Submit
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Validate required inputs
        const requiredInputs = Array.from(regForm.querySelectorAll('input[required], select[required]'));
        let firstInvalid = null;

        requiredInputs.forEach(input => {
          if (input.type === 'checkbox') {
            if (!input.checked) {
              input.style.outline = '2px solid red';
              if (!firstInvalid) firstInvalid = input;
            } else {
              input.style.outline = '';
            }
          } else {
            if (!input.value.trim()) {
              input.style.borderColor = '#D32F2F';
              if (!firstInvalid) firstInvalid = input;
            } else {
              input.style.borderColor = '';
            }
          }
        });

        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
          if (typeof window.showToast === 'function') {
            window.showToast('Please complete all required fields.', 'info');
          }
          return;
        }

        // Collect Personal Details
        const profileFor = document.getElementById('r-profile-for')?.value || 'myself';
        const fullname = document.getElementById('r-fullname')?.value.trim() || 'Candidate';
        const email = document.getElementById('r-email')?.value.trim() || '';
        const phone = document.getElementById('r-phone')?.value.trim() || '';
        const gender = document.getElementById('r-gender')?.value || 'female';
        const dob = document.getElementById('r-dob')?.value || '';

        // Calculate age
        let age = 24;
        if (dob) {
          const birthDate = new Date(dob);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (isNaN(age) || age < 18) age = 24;
        }

        const religionSelect = document.getElementById('r-religion');
        const religion = religionSelect?.options[religionSelect.selectedIndex]?.text || 'Hindu';
        const religionKey = religionSelect?.value || 'hindu';
        const caste = document.getElementById('r-caste')?.value.trim() || 'Brahmin';

        const manglikSelect = document.getElementById('r-manglik');
        const manglik = manglikSelect?.options[manglikSelect.selectedIndex]?.text || 'Non-Manglik';
        const manglikKey = manglikSelect?.value || 'non-manglik';

        const degree = document.getElementById('r-degree')?.value.trim() || 'Graduate';
        const occupation = document.getElementById('r-occupation')?.value.trim() || 'Professional';

        const incomeSelect = document.getElementById('r-income');
        const income = incomeSelect?.options[incomeSelect.selectedIndex]?.text || '₹15 - 25 Lakhs';
        const incomeKey = incomeSelect?.value || '15-25';

        const location = document.getElementById('r-location')?.value.trim() || 'Delhi NCR';
        const hobbies = document.getElementById('r-hobbies')?.value.trim() || 'Reading, Classical Music, Travel & Family get-togethers';
        const diet = document.getElementById('r-diet')?.value || 'Vegetarian';
        const about = document.getElementById('r-about')?.value.trim() || 'Values honesty, mutual respect, family traditions, and seeking an educated, loving companion to share life\'s beautiful journey.';

        const photo = uploadedPhotoBase64 || (gender === 'male' ? 'images/profile2.jpg' : 'images/profile1.jpg');

        // Collect Partner Preferences
        const partnerPreferences = {
          ageMin: document.getElementById('pref-age-min')?.value.trim() || '21',
          ageMax: document.getElementById('pref-age-max')?.value.trim() || '30',
          heightMin: document.getElementById('pref-height-min')?.value || '',
          heightMax: document.getElementById('pref-height-max')?.value || '',
          location: document.getElementById('pref-location')?.value.trim() || 'No Preference',
          profession: document.getElementById('pref-profession')?.value || 'No Preference',
          education: document.getElementById('pref-education')?.value || 'No Preference',
          religion: document.getElementById('pref-religion')?.value || 'No Preference',
          caste: document.getElementById('pref-caste')?.value.trim() || 'No Preference',
          diet: document.getElementById('pref-diet')?.value || 'No Preference',
          drinking: document.getElementById('pref-drinking')?.value || 'No Preference',
          smoking: document.getElementById('pref-smoking')?.value || 'No Preference',
          aboutPartner: document.getElementById('pref-about-partner')?.value.trim() || '',
          other: document.getElementById('pref-other')?.value.trim() || ''
        };

        const profileData = {
          profileId: existingProfile?.profileId || ('SJ-' + Math.floor(10000 + Math.random() * 90000)),
          profileFor,
          fullname,
          email,
          phone,
          gender,
          dob,
          age,
          religion,
          religionKey,
          caste,
          manglik,
          manglikKey,
          degree,
          occupation,
          income,
          incomeKey,
          location,
          hobbies,
          diet,
          about,
          photo,
          partnerPreferences,
          gallery: existingProfile?.gallery || [],
          createdAt: existingProfile?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save to localStorage under active user's isolated profile
        if (window.setUserProfile) window.setUserProfile(profileData);
        if (activeUser && fullname) {
          activeUser.name = fullname;
          sessionStorage.setItem(window.ACTIVE_USER_KEY || 'sanjog_active_user', JSON.stringify(activeUser));
          const accounts = window.getAccounts ? window.getAccounts() : [];
          const acc = accounts.find(a => a.email.toLowerCase() === activeUser.email.toLowerCase());
          if (acc) {
            acc.name = fullname;
            if (window.saveAccounts) window.saveAccounts(accounts);
          }
        }
        try {
          localStorage.setItem('sanjog_user', JSON.stringify({ name: fullname, email, phone }));
          localStorage.setItem('sanjog_logged_in', 'true');
        } catch (err) { }

        submitBtn.textContent = isEdit ? 'Profile Updated! Redirecting... ✔' : 'Profile Created! Redirecting... ✔';
        submitBtn.style.background = '#2E7D32';

        if (typeof window.showToast === 'function') {
          window.showToast(isEdit ? 'Profile updated successfully! ✔' : `Welcome to Sanjog, ${fullname}! Profile created successfully. 🎉`, 'success');
        }

        // Redirect directly to the Profile page as requested
        setTimeout(() => {
          window.location.href = 'my-profile.html';
        }, 1200);
      });
    }
  }

  // Export to window
  window.initRegistrationPage = initRegistrationPage;

})();
