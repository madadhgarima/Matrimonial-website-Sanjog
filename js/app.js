/**
 * =============================================================================
 * Sanjog Matrimonial - Main Coordinator Module (js/app.js)
 * =============================================================================
 * Responsibility:
 * Central coordination engine between all Sanjog Matrimonial functional modules.
 * Implements the toast notification feedback system, immediately enforces route
 * protection and data seeding, and coordinates page initialization when the
 * DOM is fully loaded.
 *
 * Module Architecture:
 * - js/storage.js             -> LocalStorage & SessionStorage engine
 * - js/validation.js          -> Strict email & password requirement validators
 * - js/auth.js                -> User authentication (login & signup flows)
 * - js/navigation.js          -> Access control, navbar, and route protection
 * - js/matches.js             -> Verified profiles dataset & filtering
 * - js/favorites.js           -> Shortlist / favorites management
 * - js/messages.js            -> Chat system and family communication
 * - js/notifications.js       -> Match alerts and horoscope chart sharing
 * - js/profile.js             -> Detailed biodata viewer and photo album
 * - js/partner-preferences.js -> Create Profile & Partner Preferences form
 * - js/app.js                 -> Master coordinator & toast system
 * =============================================================================
 */

(function () {
  'use strict';

  // =========================================================================
  // TOAST NOTIFICATION SYSTEM
  // =========================================================================
  function getToastContainer() {
    let container = document.querySelector('.sanjog-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'sanjog-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'success') {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `sanjog-toast ${type}`;

    let icon = '✔';
    if (type === 'info') icon = 'ℹ';
    if (message.includes('❤') || message.includes('Shortlist')) icon = '❤';
    if (message.includes('💌') || message.includes('Interest')) icon = '💌';
    if (message.includes('📞') || message.includes('Call')) icon = '📞';
    if (message.includes('🎉')) icon = '🎉';

    toast.innerHTML = `<span style="font-size: 1.1rem;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Export showToast to window immediately so all modules can call it
  window.showToast = showToast;

  // =========================================================================
  // IMMEDIATE DATA SEEDING & PAGE ACCESS CONTROL
  // =========================================================================
  if (typeof window.seedDemoAuthData === 'function') {
    window.seedDemoAuthData();
  }
  if (typeof window.enforcePageAccess === 'function') {
    if (!window.enforcePageAccess()) {
      return; // Stop initialization if unauthorized visitor is being redirected
    }
  }

  // =========================================================================
  // CENTRAL DOM READY DISPATCHER
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initNavbar === 'function') window.initNavbar();
    if (typeof window.initHomePage === 'function') window.initHomePage();
    if (typeof window.initFindMatchesPage === 'function') window.initFindMatchesPage();
    if (typeof window.initShortlistedPage === 'function') window.initShortlistedPage();
    if (typeof window.initMessagingPage === 'function') window.initMessagingPage();
    if (typeof window.initProfilePage === 'function') window.initProfilePage();
    if (typeof window.initRegistrationPage === 'function') window.initRegistrationPage();
    if (typeof window.initSignupPage === 'function') window.initSignupPage();
    if (typeof window.initLoginPage === 'function') window.initLoginPage();
    if (typeof window.initContactPage === 'function') window.initContactPage();
    if (typeof window.initNotificationsPage === 'function') window.initNotificationsPage();
  });

})();
