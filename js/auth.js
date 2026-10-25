/**
 * =============================================================================
 * Sanjog Matrimonial - Authentication Module (js/auth.js)
 * =============================================================================
 * Responsibility:
 * Controls user authentication flows for login.html and signup.html.
 * Pre-fills demo credentials for Garima Madadh (garima@example.com / Garima@123),
 * updates real-time password requirements checklist, performs strict client-side
 * email and password validation, verifies credentials against registered accounts,
 * manages active sessions, and provides password visibility toggles.
 * =============================================================================
 */

(function () {
  'use strict';

  /**
   * Helper function to fill demo credentials into login fields
   * @param {string} email
   * @param {string} password
   */
  function fillDemoLogin(email, password) {
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    if (emailInput && passInput) {
      emailInput.value = email;
      passInput.value = password;
      emailInput.classList.remove('input-invalid');
      passInput.classList.remove('input-invalid');
      const emailError = document.getElementById('email-error');
      const passError = document.getElementById('password-error');
      if (emailError) emailError.style.display = 'none';
      if (passError) passError.style.display = 'none';
      passInput.dispatchEvent(new Event('input'));
      emailInput.dispatchEvent(new Event('input'));
      if (typeof window.showToast === 'function') {
        window.showToast(`Filled demo credentials for ${email}`, 'info');
      }
    }
  }

  /**
   * Initializes the Login page (login.html)
   */
  function initLoginPage() {
    const loginForm = document.querySelector('#login-form, .form-box form');
    if (!loginForm) return;

    const msgBanner = document.getElementById('login-msg');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passError = document.getElementById('password-error');
    const rememberCheckbox = document.getElementById('remember');
    const togglePassBtn = document.getElementById('toggle-password');
    const submitBtn = document.getElementById('btn-login-submit') || loginForm.querySelector('button[type="submit"]');

    // Show/Hide password toggle
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passInput.getAttribute('type') === 'password';
        passInput.setAttribute('type', isPass ? 'text' : 'password');
        togglePassBtn.textContent = isPass ? '🙈' : '👁️';
      });
    }

    function showLoginMessage(text, type = 'error') {
      if (!msgBanner) {
        if (typeof window.showToast === 'function') {
          window.showToast(text, type === 'error' ? 'info' : 'success');
        }
        return;
      }
      msgBanner.className = `auth-msg-banner auth-msg-${type}`;
      msgBanner.innerHTML = text;
      msgBanner.style.display = 'block';
    }

    // Dynamic password requirements UI updater
    function updatePasswordRulesUI(password) {
      const res = window.validatePasswordRequirements
        ? window.validatePasswordRequirements(password)
        : { valid: false, rules: { len: false, upper: false, lower: false, num: false, special: false } };

      const setRule = (id, valid, text) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.className = 'rule-item ' + (valid ? 'rule-valid' : (password ? 'rule-invalid' : ''));
        el.textContent = (valid ? '✔ ' : (password ? '✖ ' : '⚪ ')) + text;
      };
      setRule('rule-len', res.rules.len, 'At least 8 characters');
      setRule('rule-upper', res.rules.upper, 'Uppercase letter (A–Z)');
      setRule('rule-lower', res.rules.lower, 'Lowercase letter (a–z)');
      setRule('rule-num', res.rules.num, 'Number (0–9)');
      setRule('rule-special', res.rules.special, 'Special char (@, #, $, !)');
      return res;
    }

    // Parse URL parameters for status banners
    const params = new URLSearchParams(window.location.search);
    const msgType = params.get('msg');
    const prefillEmail = params.get('email');
    const redirectTarget = params.get('redirect');

    // Pre-fill demo credentials for Garima Madadh for college evaluation
    if (prefillEmail && emailInput) {
      emailInput.value = decodeURIComponent(prefillEmail);
      passInput?.focus();
    } else {
      if (emailInput && !emailInput.value.trim()) {
        emailInput.value = 'garima@example.com';
      }
      if (passInput && !passInput.value) {
        passInput.value = 'Garima@123';
      }
    }

    // Initialize password rules display and attach live input listeners
    if (passInput) {
      updatePasswordRulesUI(passInput.value);
      passInput.addEventListener('input', () => {
        updatePasswordRulesUI(passInput.value);
        if (passError) passError.style.display = 'none';
        passInput.classList.remove('input-invalid');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        if (emailError) emailError.style.display = 'none';
        emailInput.classList.remove('input-invalid');
      });
    }

    if (msgType === 'login_required') {
      showLoginMessage('🔒 <strong>Login Required:</strong> Please log in to access your Sanjog profile, matches, messages, and protected matrimonial features.', 'info');
    } else if (msgType === 'registered') {
      showLoginMessage('🎉 <strong>Account Created Successfully!</strong> Please enter your password to sign in.', 'success');
    } else if (msgType === 'logged_out') {
      showLoginMessage('👋 <strong>Logged Out:</strong> You have been signed out safely. Your saved profile data remains preserved.', 'info');
    }

    // Active session status indicator
    const activeUser = window.getActiveUser ? window.getActiveUser() : null;
    if (activeUser && !msgType) {
      showLoginMessage(`ℹ️ You are currently signed in as <strong>${activeUser.name}</strong> (${activeUser.email}). <a href="my-profile.html" style="color:#8D3F50; font-weight:600; text-decoration:underline;">View Profile</a> or <a href="javascript:void(0)" onclick="logoutUser()" style="color:#8D3F50; font-weight:600; text-decoration:underline;">Logout</a>`, 'info');
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Reset previous error messages and styles
      if (emailError) emailError.style.display = 'none';
      if (passError) passError.style.display = 'none';
      if (msgBanner) msgBanner.style.display = 'none';
      if (emailInput) emailInput.classList.remove('input-invalid');
      if (passInput) passInput.classList.remove('input-invalid');

      const rawEmail = emailInput ? emailInput.value : '';
      const rawPassword = passInput ? passInput.value : '';
      const remember = rememberCheckbox ? rememberCheckbox.checked : false;

      let hasValidationError = false;

      // 1. Email field validation (must not be empty, must contain @ and valid domain)
      const emailValidation = window.validateEmailFormat
        ? window.validateEmailFormat(rawEmail)
        : { valid: Boolean(rawEmail), message: '' };

      if (!emailValidation.valid) {
        hasValidationError = true;
        if (emailError) {
          emailError.textContent = emailValidation.message;
          emailError.style.display = 'inline-block';
        }
        if (emailInput) {
          emailInput.classList.add('input-invalid');
          emailInput.focus();
        }
      }

      // 2. Password validation (8+ chars, uppercase, lowercase, digit, special char)
      const passwordValidation = window.validatePasswordRequirements
        ? window.validatePasswordRequirements(rawPassword)
        : { valid: Boolean(rawPassword), message: '' };

      if (!passwordValidation.valid) {
        hasValidationError = true;
        if (passError) {
          passError.textContent = passwordValidation.message;
          passError.style.display = 'block';
        }
        if (passInput) {
          passInput.classList.add('input-invalid');
          if (!emailInput?.classList.contains('input-invalid')) {
            passInput.focus();
          }
        }
      }

      // Stop submission and do NOT redirect if validation fails
      if (hasValidationError) {
        if (typeof window.showToast === 'function') {
          window.showToast('Please correct the validation errors above.', 'info');
        }
        return;
      }

      // 3. Credentials checking (case-insensitive email, exact password match)
      const accounts = window.getAccounts ? window.getAccounts() : [];
      const enteredEmailLower = rawEmail.trim().toLowerCase();
      const matchedAccount = accounts.find(
        acc => acc.email && acc.email.toLowerCase() === enteredEmailLower && acc.password === rawPassword
      );

      if (!matchedAccount) {
        // Show exact error message as required
        showLoginMessage('Invalid email or password.', 'error');
        if (passInput) passInput.classList.add('input-invalid');
        return;
      }

      // 4. Success: activate user session and redirect to Home page
      if (window.setActiveSession) {
        window.setActiveSession(matchedAccount, remember);
      }

      showLoginMessage(`✔ Welcome back, <strong>${matchedAccount.name}</strong>! Redirecting to Home...`, 'success');
      if (typeof window.showToast === 'function') {
        window.showToast(`Welcome back, ${matchedAccount.name}! Signed in successfully. ✔`, 'success');
      }

      if (submitBtn) {
        submitBtn.textContent = 'Redirecting to Home... ✔';
        submitBtn.style.background = '#2E7D32';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        window.location.href = redirectTarget ? decodeURIComponent(redirectTarget) : 'index.html';
      }, 700);
    });

    // Forgot password handler
    const forgotLink = document.getElementById('forgotLink') || document.querySelector('.forgot-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';
        if (email) {
          if (typeof window.showToast === 'function') {
            window.showToast(`Password reset link sent to ${email}! ✉`, 'success');
          }
        } else {
          if (typeof window.showToast === 'function') {
            window.showToast('Enter your email address above to receive reset instructions.', 'info');
          }
          emailInput?.focus();
        }
      });
    }

    // Ensure link to signup page
    const signupLink = document.querySelector('.signup-text a');
    if (signupLink) {
      signupLink.setAttribute('href', 'signup.html');
    }
  }

  /**
   * Initializes user registration page (signup.html)
   */
  function initSignupPage() {
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;

    const msgBanner = document.getElementById('reg-msg');
    const nameInput = document.getElementById('reg-fullname');
    const emailInput = document.getElementById('reg-email');
    const passInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm-password');
    const termsCheck = document.getElementById('reg-terms');
    const togglePassBtn = document.getElementById('toggle-reg-password');
    const toggleConfirmBtn = document.getElementById('toggle-reg-confirm');
    const submitBtn = document.getElementById('btn-reg-submit') || signupForm.querySelector('button[type="submit"]');

    // Show/Hide Password Toggles
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passInput.getAttribute('type') === 'password';
        passInput.setAttribute('type', isPass ? 'text' : 'password');
        togglePassBtn.textContent = isPass ? '🙈' : '👁️';
      });
    }

    if (toggleConfirmBtn && confirmInput) {
      toggleConfirmBtn.addEventListener('click', () => {
        const isPass = confirmInput.getAttribute('type') === 'password';
        confirmInput.setAttribute('type', isPass ? 'text' : 'password');
        toggleConfirmBtn.textContent = isPass ? '🙈' : '👁️';
      });
    }

    function showRegMessage(text, type = 'error') {
      if (!msgBanner) {
        if (typeof window.showToast === 'function') {
          window.showToast(text, type === 'error' ? 'info' : 'success');
        }
        return;
      }
      msgBanner.className = `auth-msg-banner auth-msg-${type}`;
      msgBanner.innerHTML = text;
      msgBanner.style.display = 'block';
      msgBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // If active user is already logged in, show status info
    const activeUser = window.getActiveUser ? window.getActiveUser() : null;
    if (activeUser) {
      showRegMessage(`ℹ️ You are currently signed in as <strong>${activeUser.name}</strong> (${activeUser.email}). <a href="my-profile.html" style="color:#8D3F50; font-weight:600;">Go to Profile</a> or <a href="javascript:void(0)" onclick="logoutUser()" style="color:#8D3F50; font-weight:600;">Logout</a>`, 'info');
    }

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const password = passInput ? passInput.value : '';
      const confirmPassword = confirmInput ? confirmInput.value : '';

      // Validate required fields
      if (!name || !email || !password || !confirmPassword) {
        showRegMessage('⚠️ Please complete all required fields.', 'error');
        if (!name) nameInput?.focus();
        else if (!email) emailInput?.focus();
        else if (!password) passInput?.focus();
        else confirmInput?.focus();
        return;
      }

      // Validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showRegMessage('⚠️ Please enter a valid email address (e.g. name@example.com).', 'error');
        emailInput?.focus();
        return;
      }

      // Validate password length
      if (password.length < 6) {
        showRegMessage('⚠️ Password must be at least 6 characters long.', 'error');
        passInput?.focus();
        return;
      }

      // Validate password confirmation match
      if (password !== confirmPassword) {
        showRegMessage('❌ <strong>Passwords do not match.</strong> Please verify and re-type your password.', 'error');
        if (confirmInput) {
          confirmInput.value = '';
          confirmInput.style.borderColor = '#C0392B';
          confirmInput.focus();
        }
        return;
      }

      // Terms of Service check
      if (termsCheck && !termsCheck.checked) {
        showRegMessage('⚠️ Please accept the Terms of Service to create your account.', 'error');
        return;
      }

      // Check for duplicate registered email
      const accounts = window.getAccounts ? window.getAccounts() : [];
      const duplicate = accounts.find(acc => acc.email.toLowerCase() === email);
      if (duplicate) {
        showRegMessage(`❌ An account with <strong>${email}</strong> already exists. Please <a href="login.html?email=${encodeURIComponent(email)}" style="color:#8D3F50; font-weight:600; text-decoration:underline;">sign in here</a>.`, 'error');
        emailInput?.focus();
        return;
      }

      // Register new account
      const newAccount = {
        name,
        email,
        password,
        createdAt: new Date().toISOString()
      };
      accounts.push(newAccount);
      if (window.saveAccounts) window.saveAccounts(accounts);

      // Create initial profile skeleton under this account's isolated key
      const accountProfileKey = (window.PROFILE_KEY_PREFIX || 'sanjog_profile_') + email;
      if (!localStorage.getItem(accountProfileKey)) {
        localStorage.setItem(accountProfileKey, JSON.stringify({
          profileId: 'SJ-' + Math.floor(10000 + Math.random() * 90000),
          fullname: name,
          email: email,
          createdAt: new Date().toISOString()
        }));
      }

      showRegMessage(`🎉 <strong>Account Created Successfully!</strong> Welcome to Sanjog, ${name}. Redirecting to Login...`, 'success');
      if (typeof window.showToast === 'function') {
        window.showToast(`Account registered for ${name}! Please sign in. ✔`, 'success');
      }

      if (submitBtn) {
        submitBtn.textContent = 'Account Created! Redirecting... ✔';
        submitBtn.style.background = '#2E7D32';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        window.location.href = `login.html?msg=registered&email=${encodeURIComponent(email)}`;
      }, 1200);
    });
  }

  // Export to window
  window.fillDemoLogin = fillDemoLogin;
  window.initLoginPage = initLoginPage;
  window.initSignupPage = initSignupPage;

})();
