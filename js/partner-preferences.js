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

    // Initialize preview with existing photo or neutral default avatar
    if (photoPreview) {
      const existingProfile = window.getUserProfile ? window.getUserProfile() : null;
      photoPreview.src = existingProfile?.photo || 'images/default-avatar.svg';
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

    const hasSavedDetails = !!(existingProfile && (existingProfile.dob || existingProfile.gender || existingProfile.degree));

    if (isEdit || hasSavedDetails) {
      if (heading) heading.textContent = 'Edit Your Sanjog Profile';
      if (subtitle) subtitle.textContent = 'Update your biodata details, partner expectations, and verified photo.';
      if (submitBtn) submitBtn.textContent = 'Save Changes & Update Profile ✔';

      // Prefill ONLY the actual details previously saved (no fake defaults)
      if (existingProfile?.profileFor) setValue('r-profile-for', existingProfile.profileFor);
      setValue('r-fullname', existingProfile?.fullname || (activeUser ? activeUser.name : ''));
      setValue('r-email', existingProfile?.email || (activeUser ? activeUser.email : ''));
      if (existingProfile?.phone) setValue('r-phone', existingProfile.phone);
      if (existingProfile?.gender) setValue('r-gender', existingProfile.gender);
      if (existingProfile?.dob) setValue('r-dob', existingProfile.dob);
      if (existingProfile?.religionKey || existingProfile?.religion) setValue('r-religion', existingProfile.religionKey || existingProfile.religion);
      if (existingProfile?.caste) setValue('r-caste', existingProfile.caste);
      if (existingProfile?.manglikKey || existingProfile?.manglik) setValue('r-manglik', existingProfile.manglikKey || existingProfile.manglik);
      if (existingProfile?.degree) setValue('r-degree', existingProfile.degree);
      if (existingProfile?.occupation) setValue('r-occupation', existingProfile.occupation);
      if (existingProfile?.incomeKey || existingProfile?.income) setValue('r-income', existingProfile.incomeKey || existingProfile.income);
      if (existingProfile?.location) setValue('r-location', existingProfile.location);
      if (existingProfile?.hobbies) setValue('r-hobbies', existingProfile.hobbies);
      if (existingProfile?.diet) setValue('r-diet', existingProfile.diet);
      if (existingProfile?.about) setValue('r-about', existingProfile.about);

      // Pre-fill Partner Preferences only if actually saved previously
      if (existingProfile?.partnerPreferences) {
        const pp = existingProfile.partnerPreferences;
        if (pp.ageMin) setValue('pref-age-min', pp.ageMin);
        if (pp.ageMax) setValue('pref-age-max', pp.ageMax);
        if (pp.heightMin) setValue('pref-height-min', pp.heightMin);
        if (pp.heightMax) setValue('pref-height-max', pp.heightMax);
        if (pp.location) setValue('pref-location', pp.location);
        if (pp.profession) setValue('pref-profession', pp.profession);
        if (pp.education) setValue('pref-education', pp.education);
        if (pp.religion) setValue('pref-religion', pp.religion);
        if (pp.caste) setValue('pref-caste', pp.caste);
        if (pp.diet) setValue('pref-diet', pp.diet);
        if (pp.drinking) setValue('pref-drinking', pp.drinking);
        if (pp.smoking) setValue('pref-smoking', pp.smoking);
        if (pp.aboutPartner) setValue('pref-about-partner', pp.aboutPartner);
        if (pp.other) setValue('pref-other', pp.other);
      }

      // Smooth scroll if landed via #partner-preferences edit link
      if (window.location.hash === '#partner-preferences') {
        setTimeout(() => {
          const prefAnchor = document.getElementById('partner-preferences');
          if (prefAnchor) prefAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      }

      if (existingProfile?.photo) {
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
    } else {
      // New profile for new user or authenticated user: all profile fields remain blank
      if (heading) heading.textContent = isEdit ? 'Edit Your Sanjog Profile' : 'Create Your Sanjog Profile';
      if (submitBtn) submitBtn.textContent = isEdit ? 'Save Changes & Update Profile ✔' : 'Save Changes & Create Profile ✔';

      const currentName = existingProfile?.fullname || (activeUser ? activeUser.name : '');
      const currentEmail = existingProfile?.email || (activeUser ? activeUser.email : '');
      if (currentName) setValue('r-fullname', currentName);
      if (currentEmail) setValue('r-email', currentEmail);
      if (existingProfile?.phone) setValue('r-phone', existingProfile.phone);

      const passInput = document.getElementById('r-password');
      if (passInput && (activeUser || isEdit)) {
        passInput.removeAttribute('required');
        passInput.placeholder = 'Leave blank to keep existing password';
      }
    }

    // Handle Form Submit
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. Mandatory validation for ALL Edit Profile and Partner Preference fields
        const requiredFieldIds = [
          'r-profile-for',
          'r-fullname',
          'r-email',
          'r-phone',
          'r-gender',
          'r-dob',
          'r-religion',
          'r-caste',
          'r-manglik',
          'r-degree',
          'r-occupation',
          'r-income',
          'r-location',
          'r-hobbies',
          'r-diet',
          'r-about',
          'pref-age-min',
          'pref-age-max',
          'pref-height-min',
          'pref-height-max',
          'pref-location',
          'pref-profession',
          'pref-education',
          'pref-religion',
          'pref-caste',
          'pref-diet',
          'pref-drinking',
          'pref-smoking',
          'pref-other',
          'pref-about-partner'
        ];

        // If password field is present and marked required (e.g. brand new user registration)
        const passInput = document.getElementById('r-password');
        if (passInput && passInput.hasAttribute('required')) {
          requiredFieldIds.push('r-password');
        }

        let firstInvalid = null;
        requiredFieldIds.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          const val = (el.value || '').trim();
          if (!val) {
            el.style.borderColor = '#D32F2F';
            if (!firstInvalid) firstInvalid = el;
          } else {
            el.style.borderColor = '';
          }
        });

        const termsCheck = document.getElementById('r-terms');
        if (termsCheck && !termsCheck.checked) {
          termsCheck.style.outline = '2px solid red';
          if (!firstInvalid) firstInvalid = termsCheck;
        } else if (termsCheck) {
          termsCheck.style.outline = '';
        }

        if (firstInvalid) {
          alert('Please fill all the fields before saving your profile.');
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
          return;
        }

        // 2. Collect actual entered personal details (no invented fallbacks)
        const profileFor = document.getElementById('r-profile-for')?.value.trim() || '';
        const fullname = document.getElementById('r-fullname')?.value.trim() || '';
        const email = document.getElementById('r-email')?.value.trim() || '';
        const phone = document.getElementById('r-phone')?.value.trim() || '';
        const gender = document.getElementById('r-gender')?.value.trim() || '';
        const dob = document.getElementById('r-dob')?.value.trim() || '';

        // Calculate age accurately from user's entered DOB
        let age = '';
        if (dob) {
          const birthDate = new Date(dob);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          if (!isNaN(calculatedAge) && calculatedAge > 0) {
            age = String(calculatedAge);
          }
        }

        const religionSelect = document.getElementById('r-religion');
        const religion = religionSelect ? religionSelect.options[religionSelect.selectedIndex]?.text.trim() : '';
        const religionKey = religionSelect ? religionSelect.value.trim() : '';
        const caste = document.getElementById('r-caste')?.value.trim() || '';

        const manglikSelect = document.getElementById('r-manglik');
        const manglik = manglikSelect ? manglikSelect.options[manglikSelect.selectedIndex]?.text.trim() : '';
        const manglikKey = manglikSelect ? manglikSelect.value.trim() : '';

        const degree = document.getElementById('r-degree')?.value.trim() || '';
        const occupation = document.getElementById('r-occupation')?.value.trim() || '';

        const incomeSelect = document.getElementById('r-income');
        const income = incomeSelect ? incomeSelect.options[incomeSelect.selectedIndex]?.text.trim() : '';
        const incomeKey = incomeSelect ? incomeSelect.value.trim() : '';

        const location = document.getElementById('r-location')?.value.trim() || '';
        const hobbies = document.getElementById('r-hobbies')?.value.trim() || '';
        const dietSelect = document.getElementById('r-diet');
        const diet = dietSelect ? dietSelect.options[dietSelect.selectedIndex]?.text.trim() || dietSelect.value.trim() : '';
        const about = document.getElementById('r-about')?.value.trim() || '';

        const photo = uploadedPhotoBase64 || existingProfile?.photo || 'images/default-avatar.svg';

        // 3. Collect Partner Preferences (actual entered values)
        const partnerPreferences = {
          ageMin: document.getElementById('pref-age-min')?.value.trim() || '',
          ageMax: document.getElementById('pref-age-max')?.value.trim() || '',
          heightMin: document.getElementById('pref-height-min')?.value.trim() || '',
          heightMax: document.getElementById('pref-height-max')?.value.trim() || '',
          location: document.getElementById('pref-location')?.value.trim() || '',
          profession: document.getElementById('pref-profession')?.value.trim() || '',
          education: document.getElementById('pref-education')?.value.trim() || '',
          religion: document.getElementById('pref-religion')?.value.trim() || '',
          caste: document.getElementById('pref-caste')?.value.trim() || '',
          diet: document.getElementById('pref-diet')?.value.trim() || '',
          drinking: document.getElementById('pref-drinking')?.value.trim() || '',
          smoking: document.getElementById('pref-smoking')?.value.trim() || '',
          aboutPartner: document.getElementById('pref-about-partner')?.value.trim() || '',
          other: document.getElementById('pref-other')?.value.trim() || ''
        };

        // Ensure gallery does not duplicate the primary photo
        const existingGallery = Array.isArray(existingProfile?.gallery) ? existingProfile.gallery : [];
        const cleanGallery = existingGallery.filter(p => p && p !== photo && p !== 'images/default-avatar.svg');

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
          gallery: cleanGallery,
          createdAt: existingProfile?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save to localStorage under active user's isolated profile
        if (window.setUserProfile) window.setUserProfile(profileData);
        if (activeUser && fullname) {
          activeUser.name = fullname;
          sessionStorage.setItem(window.ACTIVE_USER_KEY || 'sanjog_active_user', JSON.stringify(activeUser));
          const accounts = window.getAccounts ? window.getAccounts() : [];
          const acc = accounts.find(a => (a.email && a.email.toLowerCase() === activeUser.email?.toLowerCase()) || (a.username && a.username.toLowerCase() === activeUser.username?.toLowerCase()));
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
