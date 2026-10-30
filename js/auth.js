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
    const loginForm = document.getElementById('login-form');
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

    // Parse URL parameters for status banners
    const params = new URLSearchParams(window.location.search);
    const msgType = params.get('msg');
    const prefillEmail = params.get('email');
    const redirectTarget = params.get('redirect');

    // Pre-fill demo credentials for Garima Madadh for evaluation
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

    // Attach live input listeners to clear errors on user typing
    if (passInput) {
      passInput.addEventListener('input', () => {
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

      const rawIdentifier = emailInput ? emailInput.value.trim() : '';
      const rawPassword = passInput ? passInput.value : '';
      const remember = rememberCheckbox ? rememberCheckbox.checked : false;

      // 1. Check for empty fields and trigger JavaScript alert() messages:
      // - Both empty: "Please enter your email/username and password."
      // - Email/username empty: "Please enter your email or username."
      // - Password empty: "Please enter your password."
      if (!rawIdentifier && !rawPassword.trim()) {
        alert('Please enter your email/username and password.');
        if (emailInput) emailInput.focus();
        return;
      }

      if (!rawIdentifier) {
        alert('Please enter your email or username.');
        if (emailInput) emailInput.focus();
        return;
      }

      if (!rawPassword.trim()) {
        alert('Please enter your password.');
        if (passInput) passInput.focus();
        return;
      }

      // 2. Credentials checking:
      // Accepts either registered email address or registered username, together with password.
      const accounts = window.getAccounts ? window.getAccounts() : [];
      const enteredLower = rawIdentifier.toLowerCase();

      // Step A: Find if any registered account matches this email or username
      const existingAccount = accounts.find(acc => {
        if (!acc) return false;
        const accEmail = (acc.email || '').toLowerCase().trim();
        const emailPrefix = accEmail.includes('@') ? accEmail.split('@')[0] : '';
        const accUsername = (acc.username || '').toLowerCase().trim();
        const accName = (acc.name || '').toLowerCase().trim();
        const accNameNoSpace = accName.replace(/\s+/g, '');
        return (
          (accEmail && enteredLower === accEmail) ||
          (emailPrefix && enteredLower === emailPrefix) ||
          (accUsername && enteredLower === accUsername) ||
          (accName && enteredLower === accName) ||
          (accNameNoSpace && enteredLower === accNameNoSpace)
        );
      });

      // Step B: If account is not registered, show a clear message telling them to create an account first
      if (!existingAccount) {
        showLoginMessage(`❌ No account found for "<strong>${rawIdentifier}</strong>". Please <a href="signup.html" style="color:#8D3F50; font-weight:600; text-decoration:underline;">create an account first</a>.`, 'error');
        if (emailInput) {
          emailInput.classList.add('input-invalid');
          emailInput.focus();
        }
        return;
      }

      // Step C: If account exists, verify password
      if (existingAccount.password !== rawPassword) {
        showLoginMessage('❌ Incorrect password. Please try again or use Forgot Password.', 'error');
        if (passInput) {
          passInput.classList.add('input-invalid');
          passInput.focus();
        }
        return;
      }

      const matchedAccount = existingAccount;

      // 3. Success: activate user session and redirect to Home page
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

    // Ensure link to registration / create account page
    const signupLink = loginForm.querySelector('.signup-text a') || document.querySelector('.signup-text a');
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

    const nameError = document.getElementById('reg-name-error');
    const emailError = document.getElementById('reg-email-error');
    const passError = document.getElementById('reg-password-error');
    const confirmError = document.getElementById('reg-confirm-error');
    const passRulesBox = document.getElementById('reg-password-rules');

    const ruleLen = document.getElementById('rule-len');
    const ruleUpper = document.getElementById('rule-upper');
    const ruleLower = document.getElementById('rule-lower');
    const ruleNum = document.getElementById('rule-num');
    const ruleSpecial = document.getElementById('rule-special');
    const ruleSpace = document.getElementById('rule-space');

    function clearFieldErrors() {
      [nameError, emailError, passError, confirmError].forEach(span => {
        if (span) {
          span.style.display = 'none';
          span.textContent = '';
        }
      });
      [nameInput, emailInput, passInput, confirmInput].forEach(inp => {
        if (inp) {
          inp.classList.remove('input-invalid');
          inp.style.borderColor = '';
        }
      });
    }

    function setFieldError(inputEl, errorSpan, message) {
      if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'inline-block';
      }
      if (inputEl) {
        inputEl.classList.add('input-invalid');
        inputEl.focus();
      }
    }

    function updatePasswordRulesUI(val) {
      if (!passRulesBox) return;
      if (!val) {
        [
          [ruleLen, '⚪ At least 8 characters'],
          [ruleUpper, '⚪ Uppercase letter (A–Z)'],
          [ruleLower, '⚪ Lowercase letter (a–z)'],
          [ruleNum, '⚪ Number (0–9)'],
          [ruleSpecial, '⚪ Special character (@#$%!...)'],
          [ruleSpace, '⚪ No spaces']
        ].forEach(([el, text]) => {
          if (el) {
            el.className = 'rule-item';
            el.textContent = text;
          }
        });
        return;
      }

      const res = typeof window.validatePasswordRequirements === 'function'
        ? window.validatePasswordRequirements(val)
        : { rules: { len: val.length >= 8, upper: /[A-Z]/.test(val), lower: /[a-z]/.test(val), num: /[0-9]/.test(val), special: /[^A-Za-z0-9\s]/.test(val), noSpace: !/\s/.test(val) } };
      const r = res.rules;

      function updateItem(el, passed, label) {
        if (!el) return;
        if (passed) {
          el.className = 'rule-item rule-valid';
          el.textContent = `✓ ${label}`;
        } else {
          el.className = 'rule-item rule-invalid';
          el.textContent = `✗ ${label}`;
        }
      }

      updateItem(ruleLen, r.len, 'At least 8 characters');
      updateItem(ruleUpper, r.upper, 'Uppercase letter (A–Z)');
      updateItem(ruleLower, r.lower, 'Lowercase letter (a–z)');
      updateItem(ruleNum, r.num, 'Number (0–9)');
      updateItem(ruleSpecial, r.special, 'Special character (@#$%!...)');
      updateItem(ruleSpace, r.noSpace, 'No spaces');
    }

    // Attach input listeners for live validation feedback
    if (passInput) {
      passInput.addEventListener('focus', () => {
        if (passRulesBox) passRulesBox.style.display = 'block';
      });
      passInput.addEventListener('input', () => {
        if (passRulesBox) passRulesBox.style.display = 'block';
        updatePasswordRulesUI(passInput.value);
        if (passError) {
          passError.style.display = 'none';
          passError.textContent = '';
        }
        passInput.classList.remove('input-invalid');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        if (emailError) {
          emailError.style.display = 'none';
          emailError.textContent = '';
        }
        emailInput.classList.remove('input-invalid');
      });
    }

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (nameError) {
          nameError.style.display = 'none';
          nameError.textContent = '';
        }
        nameInput.classList.remove('input-invalid');
      });
    }

    if (confirmInput) {
      confirmInput.addEventListener('input', () => {
        if (confirmError) {
          confirmError.style.display = 'none';
          confirmError.textContent = '';
        }
        confirmInput.classList.remove('input-invalid');
        confirmInput.style.borderColor = '';
      });
    }

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
      clearFieldErrors();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value : '';
      const confirmPassword = confirmInput ? confirmInput.value : '';

      // Validate Full Name
      if (!name) {
        setFieldError(nameInput, nameError, 'Please enter your full name.');
        showRegMessage('⚠️ Please enter your full name.', 'error');
        return;
      }

      // Validate Gmail Address using validateEmailFormat
      const emailValidation = typeof window.validateEmailFormat === 'function'
        ? window.validateEmailFormat(email, true)
        : { valid: /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email), message: 'Please enter a valid @gmail.com address.' };

      if (!emailValidation.valid) {
        setFieldError(emailInput, emailError, emailValidation.message);
        showRegMessage(`⚠️ ${emailValidation.message}`, 'error');
        return;
      }

      // Validate Password using validatePasswordRequirements
      const passwordValidation = typeof window.validatePasswordRequirements === 'function'
        ? window.validatePasswordRequirements(password)
        : { valid: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/.test(password), message: 'Password does not meet requirements.' };

      if (!passwordValidation.valid) {
        if (passRulesBox) passRulesBox.style.display = 'block';
        updatePasswordRulesUI(password);
        setFieldError(passInput, passError, passwordValidation.message);
        showRegMessage(`⚠️ ${passwordValidation.message}`, 'error');
        return;
      }

      // Validate Confirm Password
      if (!confirmPassword) {
        setFieldError(confirmInput, confirmError, 'Please confirm your password.');
        showRegMessage('⚠️ Please confirm your password.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        setFieldError(confirmInput, confirmError, 'Passwords do not match.');
        showRegMessage('❌ <strong>Passwords do not match.</strong> Please verify and re-type your password.', 'error');
        return;
      }

      // Terms of Service check
      if (termsCheck && !termsCheck.checked) {
        showRegMessage('⚠️ Please accept the Terms of Service to create your account.', 'error');
        return;
      }

      // Check for duplicate registered identifier
      const accounts = window.getAccounts ? window.getAccounts() : [];
      const emailLower = email.toLowerCase();
      const usernameFromEmail = emailLower.split('@')[0];

      const duplicate = accounts.find(acc => {
        if (!acc) return false;
        const accEmail = (acc.email || '').toLowerCase().trim();
        const accUsername = (acc.username || '').toLowerCase().trim();
        return accEmail === emailLower || accUsername === usernameFromEmail;
      });

      if (duplicate) {
        setFieldError(emailInput, emailError, 'Email already registered.');
        showRegMessage(`❌ An account with <strong>${email}</strong> already exists. Please <a href="login.html?email=${encodeURIComponent(email)}" style="color:#8D3F50; font-weight:600; text-decoration:underline;">sign in here</a>.`, 'error');
        return;
      }

      // Register new account (Gmail-only registration)
      const newAccount = {
        name,
        username: usernameFromEmail,
        email: emailLower,
        password,
        createdAt: new Date().toISOString()
      };
      accounts.push(newAccount);
      if (window.saveAccounts) window.saveAccounts(accounts);

      // Create initial profile skeleton under this account's isolated key
      const accountProfileKey = (window.PROFILE_KEY_PREFIX || 'sanjog_profile_') + emailLower;
      if (!localStorage.getItem(accountProfileKey)) {
        localStorage.setItem(accountProfileKey, JSON.stringify({
          profileId: 'SJ-' + Math.floor(10000 + Math.random() * 90000),
          fullname: name,
          email: emailLower,
          username: usernameFromEmail,
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
        window.location.href = `login.html?msg=registered&email=${encodeURIComponent(emailLower)}`;
      }, 1200);
    });

    // Ensure link to login page
    const loginLink = signupForm.querySelector('.signup-text a') || document.querySelector('.signup-text a');
    if (loginLink) {
      loginLink.setAttribute('href', 'login.html');
    }
  }

  // Export to window
  window.fillDemoLogin = fillDemoLogin;
  window.initLoginPage = initLoginPage;
  window.initSignupPage = initSignupPage;

})();
