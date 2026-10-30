/**
 * =============================================================================
 * Sanjog Matrimonial - Navigation Module (js/navigation.js)
 * =============================================================================
 * Responsibility:
 * Manages website navigation, active page highlighting, mobile menu toggling,
 * private page access control (route protection), homepage hero buttons, and
 * contact form handling.
 * =============================================================================
 */

(function () {
  'use strict';

  /**
   * Restricts unauthorized access to private matrimonial pages.
   * If a visitor is not logged in, redirects them to login.html with a return redirect URL.
   * @returns {boolean} True if access is allowed, false if redirected.
   */
  function enforcePageAccess() {
    const rawPath = window.location.pathname.toLowerCase();
    // Normalize page name (strip directory paths and leading slashes)
    const pageName = rawPath.split('/').pop() || 'index.html';

    const protectedPages = [
      'register.html',
      'my-profile.html',
      'find-matches.html',
      'matches.html',
      'my-matches.html',
      'favourite.html',
      'shortlisted.html',
      'messages.html',
      'message.html',
      'notifications.html',
      'profile.html'
    ];

    const isProtected = protectedPages.some(page => pageName === page || pageName.startsWith(page));

    if (isProtected && !window.isLoggedIn()) {
      const returnUrl = encodeURIComponent(pageName + window.location.search);
      window.location.replace(`login.html?msg=login_required&redirect=${returnUrl}`);
      return false;
    }
    return true;
  }

  /**
   * Initializes navbar links, active page indicators, mobile menu, and user session controls
   */
  function initNavbar() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // If href is '#' or empty, assign its standard mapping
      if (!href || href === '#') {
        const text = link.textContent.trim().toLowerCase();
        if (text.includes('home')) link.setAttribute('href', 'index.html');
        else if (text.includes('find matches')) link.setAttribute('href', 'find-matches.html');
        else if (text.includes('my matches')) link.setAttribute('href', 'my-matches.html');
        else if (text.includes('favorite') || text.includes('shortlist')) link.setAttribute('href', 'shortlisted.html');
        else if (text.includes('message')) link.setAttribute('href', 'messages.html');
        else if (text.includes('notification')) link.setAttribute('href', 'notifications.html');
        else if (text.includes('profile')) link.setAttribute('href', 'my-profile.html');
        else if (text.includes('about')) link.setAttribute('href', 'about.html');
        else if (text.includes('contact')) link.setAttribute('href', 'contact.html');
      }

      // Mark active link
      const targetHref = link.getAttribute('href');
      if (targetHref === currentPath || (currentPath === '' && targetHref === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile hamburger menu on link click
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
      navLinks.forEach(l => l.addEventListener('click', () => { navToggle.checked = false; }));
    }

    // Dynamic navbar actions depending on active user login state
    const activeUser = window.getActiveUser();
    const navActionsContainers = document.querySelectorAll('.nav-actions');

    navActionsContainers.forEach(container => {
      if (activeUser) {
        const firstName = activeUser.name.split(' ')[0] || 'My Profile';
        container.innerHTML = `
          <a href="my-profile.html" class="btn btn-outline btn-sm nav-user-btn" style="display:inline-flex; align-items:center; gap:6px;" title="Signed in as ${activeUser.name} (${activeUser.email})">
            <span>👤</span>
            <span style="max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${firstName}</span>
          </a>
          <button type="button" class="btn btn-primary btn-sm nav-logout-btn" onclick="logoutUser()" style="cursor:pointer; border:none; display:inline-flex; align-items:center; gap:4px;">
            <span>Logout</span> <span>🚪</span>
          </button>
        `;
      } else {
        container.innerHTML = `
          <a href="login.html" class="btn btn-outline btn-sm">Login</a>
          <a href="signup.html" class="btn btn-primary btn-sm">Register</a>
        `;
      }
    });

    // Update any Register buttons pointing to register.html to point to signup.html
    const regLinks = document.querySelectorAll('a[href="register.html"]');
    regLinks.forEach(link => {
      const text = link.textContent.trim().toLowerCase();
      if (text === 'register' || text === 'create account' || text === 'sign up') {
        link.setAttribute('href', 'signup.html');
      }
    });
  }

  /**
   * Initializes homepage specific action buttons
   */
  function initHomePage() {
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions) {
      const createBtn = heroActions.querySelector('a.btn-primary');
      if (createBtn) {
        createBtn.setAttribute('href', 'register.html');
      }
    }
  }

  /**
   * Initializes contact page query form submission
   */
  function initContactPage() {
    const contactForm = document.getElementById('contact-form') || document.querySelector('.contact-grid form');
    if (!contactForm) return;

    const submitBtn = document.getElementById('contact-submit-btn') || contactForm.querySelector('button[type="submit"]') || contactForm.querySelector('button');
    if (submitBtn) {
      submitBtn.textContent = 'Submit Inquiry';
    }

    const nameInput = document.getElementById('c-name');
    const emailInput = document.getElementById('c-email');
    const phoneInput = document.getElementById('c-phone');
    const subjectSelect = document.getElementById('c-subject');
    const msgInput = document.getElementById('c-message');
    let statusMsg = document.getElementById('contact-status-msg');

    if (!statusMsg) {
      statusMsg = document.createElement('div');
      statusMsg.id = 'contact-status-msg';
      statusMsg.style.display = 'none';
      statusMsg.style.marginBottom = '16px';
      statusMsg.style.padding = '12px 16px';
      statusMsg.style.borderRadius = 'var(--radius-sm, 6px)';
      statusMsg.style.fontSize = '14px';
      statusMsg.style.fontWeight = '500';
      contactForm.insertBefore(statusMsg, contactForm.firstChild);
    }

    // Clear field errors on user input
    [nameInput, emailInput, phoneInput, msgInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          inp.style.borderColor = '';
          if (statusMsg && statusMsg.dataset.type === 'error') {
            statusMsg.style.display = 'none';
          }
        });
      }
    });

    const showFeedback = (msg, isSuccess, targetEl) => {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.dataset.type = isSuccess ? 'success' : 'error';
        if (isSuccess) {
          statusMsg.style.background = '#E8F5E9';
          statusMsg.style.color = '#2E7D32';
          statusMsg.style.border = '1px solid #A5D6A7';
          statusMsg.textContent = '✔ ' + msg;
        } else {
          statusMsg.style.background = '#FFEBEE';
          statusMsg.style.color = '#C62828';
          statusMsg.style.border = '1px solid #FFCDD2';
          statusMsg.textContent = '⚠️ ' + msg;
        }
      }
      if (targetEl) {
        targetEl.style.borderColor = '#D32F2F';
        targetEl.focus();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(msg, isSuccess ? 'success' : 'info');
      }
    };

    let isSubmitting = false;
    const handleInquirySubmit = (e) => {
      if (e) e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const msgVal = msgInput ? msgInput.value.trim() : '';

      // 1. Validate Full Name
      if (!nameVal || nameVal.length < 2) {
        showFeedback('Please enter your full name.', false, nameInput);
        isSubmitting = false;
        return;
      }

      // 2. Validate Email Address
      let emailValid = false;
      if (typeof window.validateEmailFormat === 'function') {
        const emailCheck = window.validateEmailFormat(emailVal, false);
        emailValid = emailCheck.valid;
      } else {
        emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailVal);
      }
      if (!emailValid) {
        showFeedback('Please enter a valid email address (e.g. name@example.com).', false, emailInput);
        isSubmitting = false;
        return;
      }

      // 3. Validate Phone Number
      const digitsOnly = phoneVal.replace(/[^0-9]/g, '');
      if (!phoneVal || digitsOnly.length < 7) {
        showFeedback('Please enter a valid phone number (at least 7 to 10 digits).', false, phoneInput);
        isSubmitting = false;
        return;
      }

      // 4. Validate Message / Query
      if (!msgVal || msgVal.length < 5) {
        showFeedback('Please describe your requirement or query in the message box.', false, msgInput);
        isSubmitting = false;
        return;
      }

      // Clear any field error styling
      [nameInput, emailInput, phoneInput, msgInput].forEach(inp => {
        if (inp) inp.style.borderColor = '';
      });

      // Reset inquiry form
      contactForm.reset();

      // Ensure button text remains "Submit Inquiry"
      if (submitBtn) {
        submitBtn.textContent = 'Submit Inquiry';
      }

      // Display inquiry success confirmation
      showFeedback('Your inquiry has been submitted successfully! Our team will get back to you soon.', true);

      setTimeout(() => {
        isSubmitting = false;
      }, 500);
    };

    contactForm.addEventListener('submit', handleInquirySubmit);
    if (submitBtn) {
      submitBtn.addEventListener('click', handleInquirySubmit);
    }
  }

  // Export functions to window for cross-module accessibility
  window.enforcePageAccess = enforcePageAccess;
  window.initNavbar = initNavbar;
  window.initHomePage = initHomePage;
  window.initContactPage = initContactPage;

})();
