/**
 * =============================================================================
 * Sanjog Matrimonial - Notifications Module (js/notifications.js)
 * =============================================================================
 * Responsibility:
 * Handles interactions on the notifications page (notifications.html), such as
 * replying to member inquiries, viewing recommended matches, and sharing
 * horoscope charts with interested families.
 * =============================================================================
 */

(function () {
  'use strict';

  /**
   * Initializes notifications page action buttons
   */
  function initNotificationsPage() {
    const cards = document.querySelectorAll('.notification-card');
    cards.forEach(card => {
      const btn = card.querySelector('.btn');
      if (btn) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('reply')) {
          btn.setAttribute('href', 'messages.html');
        } else if (text.includes('view match')) {
          btn.setAttribute('href', 'profile.html?id=5');
        } else if (text.includes('share chart')) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.textContent = '✔ Chart Shared';
            btn.classList.add('btn-interest-sent');
            if (typeof window.showToast === 'function') {
              window.showToast('Horoscope chart shared with Rohan Mehta! 📜', 'success');
            }
          });
        }
      }
    });
  }

  // Export to window
  window.initNotificationsPage = initNotificationsPage;

})();
