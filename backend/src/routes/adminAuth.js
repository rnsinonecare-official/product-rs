const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Load credentials securely from environment variables.
// NEVER hardcode credentials or defaults in your source code.
const ADMIN_ID = process.env.ADMIN_ID;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

// A utility to generate a hash for your password.
// Run this once locally: node -e "console.log(require('bcrypt').hashSync('your_password_here', 12))"
// Then set the output as ADMIN_PASSWORD_HASH in your environment.
if (!ADMIN_ID || !ADMIN_PASSWORD_HASH || !ADMIN_API_KEY) {
  console.error('FATAL ERROR: Admin authentication environment variables are not set.');
  // In a production environment, you should prevent the server from starting.
  // process.exit(1);
}

// POST /api/admin/auth/admin-login
router.post('/auth/admin-login', async (req, res) => {
  try {
    const { email, password, username } = req.body || {};

    const providedId = (username || email || '').toString().trim();
    const providedPassword = (password || '').toString();

    if (!providedId || !providedPassword) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required.' });
    }

    const isPasswordMatch = await bcrypt.compare(providedPassword, ADMIN_PASSWORD_HASH);

    if (providedId === ADMIN_ID && isPasswordMatch) {
      return res.json({
        success: true,
        token: ADMIN_API_KEY,
        message: 'Admin login successful'
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});

// GET /api/admin/auth/verify-admin
router.get('/auth/verify-admin', (req, res) => {
  const token = req.headers['x-admin-api-key'] || req.query.token || '';

  if (token && token === ADMIN_API_KEY) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Invalid or missing token' });
});

module.exports = router;