/**
 * =============================================================================
 * Sanjog Matrimonial - Storage Module (js/storage.js)
 * =============================================================================
 * Responsibility:
 * Centralizes all data persistence operations using browser localStorage and
 * sessionStorage. Manages demo accounts, active user login sessions, shortlisted
 * favorites, express interests, and user matrimonial profiles.
 * =============================================================================
 */

(function () {
  'use strict';

  // Storage key constants
  const ACCOUNTS_KEY = 'sanjog_accounts';
  const ACTIVE_USER_KEY = 'sanjog_active_user';
  const REMEMBERED_USER_KEY = 'sanjog_remembered_user';
  const PROFILE_KEY_PREFIX = 'sanjog_profile_';

  // Configured demo account for college evaluation
  const DEFAULT_DEMO_ACCOUNTS = [
    {
      name: 'Garima Madadh',
      email: 'garima@example.com',
      password: 'Garima@123',
      createdAt: '2026-01-15T10:00:00.000Z'
    }
  ];

  // Pre-configured profile for Garima Madadh
  const DEFAULT_GARIMA_PROFILE = {
    profileId: 'SJ-98241',
    profileFor: 'myself',
    fullname: 'Garima Madadh',
    email: 'garima@example.com',
    phone: '+91 98765 43210',
    gender: 'female',
    dob: '2001-04-14',
    age: '24',
    religion: 'Hindu',
    religionKey: 'hindu',
    caste: 'Brahmin',
    manglik: 'Non-Manglik',
    manglikKey: 'non-manglik',
    degree: 'B.Tech / MCA',
    occupation: 'Software Engineer',
    income: '₹15 - 20 Lakhs / Year',
    incomeKey: '15-25',
    location: 'Delhi NCR, India',
    hobbies: 'Reading, Music, Traveling',
    diet: 'Vegetarian',
    about: 'Educated, compassionate, and family-oriented professional seeking a compatible life partner who values traditions and mutual respect.',
    photo: 'images/profile1.jpg',
    partnerPreferences: {
      ageMin: '24',
      ageMax: '30',
      heightMin: "5'7\"",
      heightMax: "6'2\"",
      location: 'Delhi NCR, Mumbai, Bengaluru',
      profession: 'IT / Software',
      education: "Bachelor's Degree",
      religion: 'Hindu',
      caste: 'No Preference',
      diet: 'Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      aboutPartner: 'Seeking an educated, humble, and supportive life partner who respects family values.',
      other: 'Non-Manglik preferred'
    },
    gallery: ['images/profile1.jpg'],
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z'
  };

  /**
   * Seeds demo account and ensures Garima Madadh is active with configured credentials
   */
  function seedDemoAuthData() {
    try {
      let accounts = [];
      const rawAccounts = localStorage.getItem(ACCOUNTS_KEY);
      if (rawAccounts) {
        try { accounts = JSON.parse(rawAccounts); } catch (e) { accounts = []; }
      }
      // Ensure Garima Madadh demo account is present and active with configured credentials
      const garimaIdx = accounts.findIndex(a => a.email && a.email.toLowerCase() === 'garima@example.com');
      if (garimaIdx >= 0) {
        accounts[garimaIdx].name = 'Garima Madadh';
        accounts[garimaIdx].password = 'Garima@123';
      } else {
        accounts.unshift(DEFAULT_DEMO_ACCOUNTS[0]);
      }
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

      const garimaKey = PROFILE_KEY_PREFIX + 'garima@example.com';
      if (!localStorage.getItem(garimaKey)) {
        localStorage.setItem(garimaKey, JSON.stringify(DEFAULT_GARIMA_PROFILE));
      }
    } catch (e) {
      console.warn('Could not seed demo accounts', e);
    }
  }

  /**
   * Retrieves all registered user accounts from localStorage
   */
  function getAccounts() {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEMO_ACCOUNTS;
    } catch (e) {
      return DEFAULT_DEMO_ACCOUNTS;
    }
  }

  /**
   * Saves updated accounts list into localStorage
   */
  function saveAccounts(accounts) {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) { }
  }

  /**
   * Retrieves currently logged in user session from sessionStorage
   * (Falls back to localStorage if "Remember Me" was checked)
   */
  function getActiveUser() {
    try {
      let session = sessionStorage.getItem(ACTIVE_USER_KEY);
      if (!session) {
        session = localStorage.getItem(REMEMBERED_USER_KEY);
        if (session) {
          sessionStorage.setItem(ACTIVE_USER_KEY, session);
        }
      }
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Establishes active login session in sessionStorage and localStorage
   */
  function setActiveSession(user, remember = false) {
    try {
      const sessionData = JSON.stringify({ name: user.name, email: user.email.toLowerCase().trim() });
      sessionStorage.setItem(ACTIVE_USER_KEY, sessionData);
      if (remember) {
        localStorage.setItem(REMEMBERED_USER_KEY, sessionData);
      } else {
        localStorage.removeItem(REMEMBERED_USER_KEY);
      }
      // Sync legacy keys for backward compatibility
      localStorage.setItem('sanjog_logged_in', 'true');
      localStorage.setItem('sanjog_user', sessionData);
    } catch (e) { }
  }

  /**
   * Clears active login session from browser storage
   */
  function clearActiveSession() {
    try {
      sessionStorage.removeItem(ACTIVE_USER_KEY);
      localStorage.removeItem(REMEMBERED_USER_KEY);
      localStorage.removeItem('sanjog_logged_in');
      localStorage.removeItem('sanjog_user');
    } catch (e) { }
  }

  /**
   * Checks whether a visitor has an active authenticated session
   */
  function isLoggedIn() {
    return getActiveUser() !== null;
  }

  /**
   * Logs out the user safely and redirects to the login page
   */
  function logoutUser() {
    clearActiveSession();
    if (typeof window.showToast === 'function') {
      window.showToast('You have logged out safely. 👋', 'info');
    }
    setTimeout(() => {
      window.location.href = 'login.html?msg=logged_out';
    }, 600);
  }

  /**
   * Retrieves array of shortlisted profile IDs from localStorage
   */
  function getFavorites() {
    try {
      const data = localStorage.getItem('sanjog_favorites');
      return data ? JSON.parse(data) : ['1', '2', '3']; // Default 3 favorites
    } catch (e) {
      return ['1', '2', '3'];
    }
  }

  /**
   * Saves updated shortlisted profile IDs array into localStorage
   */
  function setFavorites(arr) {
    try {
      localStorage.setItem('sanjog_favorites', JSON.stringify(arr));
    } catch (e) { }
  }

  /**
   * Retrieves array of candidate IDs where interest was expressed
   */
  function getInterests() {
    try {
      const data = localStorage.getItem('sanjog_interests');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Saves array of candidate IDs where interest was expressed
   */
  function setInterests(arr) {
    try {
      localStorage.setItem('sanjog_interests', JSON.stringify(arr));
    } catch (e) { }
  }

  /**
   * Retrieves matrimonial profile object for currently logged in user
   * (Account-isolated via PROFILE_KEY_PREFIX + email)
   */
  function getUserProfile() {
    try {
      const active = getActiveUser();
      if (active && active.email) {
        const userKey = PROFILE_KEY_PREFIX + active.email.toLowerCase().trim();
        const raw = localStorage.getItem(userKey);
        if (raw) return JSON.parse(raw);
      }
      // Fallback for demo/legacy mode
      const legacy = localStorage.getItem('sanjog_user_profile');
      return legacy ? JSON.parse(legacy) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Saves updated matrimonial profile object into localStorage for active user
   */
  function setUserProfile(profile) {
    try {
      const active = getActiveUser();
      if (active && active.email) {
        const userKey = PROFILE_KEY_PREFIX + active.email.toLowerCase().trim();
        localStorage.setItem(userKey, JSON.stringify(profile));
      }
      // Also update legacy key for backward compatibility
      localStorage.setItem('sanjog_user_profile', JSON.stringify(profile));
    } catch (e) { }
  }

  /**
   * Resets active profile to clean state for testing/college demonstration
   */
  function resetDemoProfile() {
    const active = getActiveUser();
    if (active && active.email) {
      localStorage.removeItem(PROFILE_KEY_PREFIX + active.email.toLowerCase().trim());
    }
    localStorage.removeItem('sanjog_user_profile');
    if (typeof window.showToast === 'function') {
      window.showToast('Profile reset to clean state.', 'info');
    }
    setTimeout(() => window.location.reload(), 700);
  }

  // Export all storage functions and constants to window for cross-module accessibility
  window.ACCOUNTS_KEY = ACCOUNTS_KEY;
  window.ACTIVE_USER_KEY = ACTIVE_USER_KEY;
  window.REMEMBERED_USER_KEY = REMEMBERED_USER_KEY;
  window.PROFILE_KEY_PREFIX = PROFILE_KEY_PREFIX;
  window.DEFAULT_DEMO_ACCOUNTS = DEFAULT_DEMO_ACCOUNTS;
  window.DEFAULT_GARIMA_PROFILE = DEFAULT_GARIMA_PROFILE;

  window.seedDemoAuthData = seedDemoAuthData;
  window.getAccounts = getAccounts;
  window.saveAccounts = saveAccounts;
  window.getActiveUser = getActiveUser;
  window.setActiveSession = setActiveSession;
  window.clearActiveSession = clearActiveSession;
  window.isLoggedIn = isLoggedIn;
  window.logoutUser = logoutUser;
  window.getFavorites = getFavorites;
  window.setFavorites = setFavorites;
  window.getInterests = getInterests;
  window.setInterests = setInterests;
  window.getUserProfile = getUserProfile;
  window.setUserProfile = setUserProfile;
  window.resetDemoProfile = resetDemoProfile;

})();
