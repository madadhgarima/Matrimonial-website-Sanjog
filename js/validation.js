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
   * Checks: non-empty, contains '@', has username, has valid domain format
   * Rejects: garima.com, garima@, @gmail.com
   * @param {string} email
   * @returns {{ valid: boolean, message: string }}
   */
  function validateEmailFormat(email) {
    if (!email || !email.trim()) {
      return { valid: false, message: 'Email address cannot be empty.' };
    }
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      return { valid: false, message: 'Email must contain an "@" symbol (e.g. garima@example.com).' };
    }
    if (trimmed.startsWith('@')) {
      return { valid: false, message: 'Email username is missing before "@".' };
    }
    if (trimmed.endsWith('@')) {
      return { valid: false, message: 'Email domain is missing after "@".' };
    }
    // Strict domain validation: reject garima.com, garima@, @gmail.com
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Invalid domain format. Use e.g. garima@example.com.' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Validates password against 5 mandatory security rules:
   * 1. At least 8 characters
   * 2. At least one uppercase letter (A–Z)
   * 3. At least one lowercase letter (a–z)
   * 4. At least one digit (0–9)
   * 5. At least one special character (@, #, $, !, etc.)
   * @param {string} password
   * @returns {{ valid: boolean, message: string, rules: Object }}
   */
  function validatePasswordRequirements(password) {
    if (!password) {
      return {
        valid: false,
        message: 'Password cannot be empty.',
        rules: { len: false, upper: false, lower: false, num: false, special: false }
      };
    }
    const rules = {
      len: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      num: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=~/\\\[\]]/.test(password)
    };
    const failedDescriptions = [];
    if (!rules.len) failedDescriptions.push('at least 8 characters');
    if (!rules.upper) failedDescriptions.push('one uppercase letter (A–Z)');
    if (!rules.lower) failedDescriptions.push('one lowercase letter (a–z)');
    if (!rules.num) failedDescriptions.push('one digit (0–9)');
    if (!rules.special) failedDescriptions.push('one special character (@, #, $, !)');

    return {
      valid: failedDescriptions.length === 0,
      message: failedDescriptions.length > 0 ? `Password must have: ${failedDescriptions.join(', ')}.` : '',
      rules
    };
  }

  // Export functions to window for cross-module accessibility
  window.validateEmailFormat = validateEmailFormat;
  window.validatePasswordRequirements = validatePasswordRequirements;

})();
