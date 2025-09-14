// Admin authentication middleware
const adminAuth = (req, res, next) => {
  // In production, you would implement proper admin authentication
  // For now, we'll use a simple API key approach
  
  const adminApiKey = req.headers['x-admin-api-key'];
  const validAdminKey = process.env.ADMIN_API_KEY || 'rainscare_admin_key_2024';
  
  // Check admin API key
  if (!adminApiKey || adminApiKey !== validAdminKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin access required. Please provide valid x-admin-api-key header.'
    });
  }
  
  next();
};

module.exports = { adminAuth };