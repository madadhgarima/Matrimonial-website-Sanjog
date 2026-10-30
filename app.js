/**
 * =============================================================================
 * Sanjog Matrimonial - Root Script (Refactored)
 * =============================================================================
 * Notice:
 * The original monolithic 2,136-line app.js has been successfully refactored
 * into 11 logical, beginner-friendly modules located in the `js/` directory:
 *
 *   1. js/storage.js             - LocalStorage and SessionStorage operations
 *   2. js/validation.js          - Email and password validation logic
 *   3. js/auth.js                - User login and registration authentication
 *   4. js/navigation.js          - Route protection, navbar links, and contacts
 *   5. js/matches.js             - Profiles database and search filtering
 *   6. js/favorites.js           - Shortlisted candidates management
 *   7. js/messages.js            - Messaging and chat system
 *   8. js/notifications.js       - Match alerts and notifications
 *   9. js/profile.js             - Biodata viewer and photo gallery
 *  10. js/partner-preferences.js - Create Profile form and partner preferences
 *  11. js/app.js                 - Central coordinator & toast notifications
 *
 * The original monolithic code has been safely backed up to:
 *   - backup/app.original.js
 *   - app.backup.js
 *
 * For HTML pages, each file loads the modular scripts from `js/`.
 * In Node.js testing environments, this file seamlessly loads and runs the 11
 * modules in their verified dependency order.
 * =============================================================================
 */

if (typeof require !== 'undefined' && typeof module !== 'undefined') {
  const fs = require('fs');
  const path = require('path');
  const modules = [
    'storage.js',
    'validation.js',
    'auth.js',
    'navigation.js',
    'matches.js',
    'favorites.js',
    'messages.js',
    'notifications.js',
    'profile.js',
    'partner-preferences.js',
    'app.js'
  ];

  const baseDir = fs.existsSync(path.join(__dirname, 'js'))
    ? path.join(__dirname, 'js')
    : path.join('c:\\Users\\madad\\OneDrive\\Desktop\\Bandhan', 'js');

  modules.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
      const code = fs.readFileSync(filePath, 'utf8');
      eval(code);
    }
  });
}
