/**
 * =============================================================================
 * Sanjog Matrimonial - Validation Module (js/validation.js)
 * =============================================================================
 * Responsibility:
 * Centralizes input format checks and validation rules for email and password
 * fields. Enforces college evaluation criteria: rejecting empty strings, missing '@',
 * missing username, missing domain, and requiring a 5-point password policy.
 * =============================================================================
 */

(function () {
  'use strict';

  /**
   * Validates email address format
   * Requires: valid format, no spaces, Gmail-only registration ending in @gmail.com
   * Rejects: missing usernames, spaces, non-gmail domains, malformed usernames with leading/trailing/consecutive dots
   * @param {string} email
   * @param {boolean} [gmailOnly=true] - Whether to require @gmail.com
   * @returns {{ valid: boolean, message: string }}
   */
  function validateEmailFormat(email, gmailOnly = true) {
    if (!email || !email.trim()) {
      return { valid: false, message: 'Gmail address cannot be empty.' };
    }
    if (/\s/.test(email)) {
      return { valid: false, message: 'Gmail address cannot contain spaces.' };
    }
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      return { valid: false, message: 'Gmail address must contain "@gmail.com".' };
    }
    if (trimmed.startsWith('@')) {
      return { valid: false, message: 'Gmail username is missing before "@".' };
    }
    if (trimmed.endsWith('@')) {
      return { valid: false, message: 'Gmail domain is missing after "@".' };
    }

    const parts = trimmed.split('@');
    if (parts.length !== 2) {
      return { valid: false, message: 'Invalid email address format.' };
    }
    const username = parts[0];
    const domain = parts[1].toLowerCase();

    if (gmailOnly) {
      if (domain !== 'gmail.com') {
        return { valid: false, message: 'Only Gmail addresses ending in @gmail.com are accepted.' };
      }

      if (username.startsWith('.') || username.endsWith('.')) {
        return { valid: false, message: 'Gmail username cannot begin or end with a dot (.).' };
      }

      if (username.includes('..')) {
        return { valid: false, message: 'Gmail username cannot contain consecutive dots (..).' };
      }

      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
      if (!gmailRegex.test(trimmed)) {
        return { valid: false, message: 'Invalid Gmail address format.' };
      }
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmed)) {
        return { valid: false, message: 'Invalid email address format.' };
      }
    }

    return { valid: true, message: '' };
  }

  /**
   * Validates password against all 6 mandatory security rules:
   * 1. At least 8 characters long
   * 2. At least one uppercase letter (A–Z)
   * 3. At least one lowercase letter (a–z)
   * 4. At least one number (0–9)
   * 5. At least one special character (@, #, $, !, %, etc.)
   * 6. No spaces
   *
   * Uses regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/
   * @param {string} password
   * @returns {{ valid: boolean, message: string, rules: Object }}
   */
  function validatePasswordRequirements(password) {
    if (!password) {
      return {
        valid: false,
        message: 'Password cannot be empty.',
        rules: { len: false, upper: false, lower: false, num: false, special: false, noSpace: false }
      };
    }
    const hasSpace = /\s/.test(password);
    const rules = {
      len: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      num: /[0-9]/.test(password),
      special: /[^A-Za-z0-9\s]/.test(password),
      noSpace: !hasSpace
    };

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;
    const isValid = passwordRegex.test(password);

    const failedDescriptions = [];
    if (!rules.len) failedDescriptions.push('at least 8 characters');
    if (!rules.upper) failedDescriptions.push('one uppercase letter (A–Z)');
    if (!rules.lower) failedDescriptions.push('one lowercase letter (a–z)');
    if (!rules.num) failedDescriptions.push('one number (0–9)');
    if (!rules.special) failedDescriptions.push('one special character (@, #, $, !, etc.)');
    if (!rules.noSpace) failedDescriptions.push('no spaces');

    return {
      valid: isValid && rules.noSpace,
      message: failedDescriptions.length > 0 ? `Password must have: ${failedDescriptions.join(', ')}.` : '',
      rules
    };
  }

  // Export functions to window for cross-module accessibility
  window.validateEmailFormat = validateEmailFormat;
  window.validateGmailFormat = validateEmailFormat;
  window.validatePasswordRequirements = validatePasswordRequirements;

})();
