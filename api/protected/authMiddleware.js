const { requireAuth } = require('./requireAuth');

function withAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    try {
      req.user = requireAuth(req); // agrega user al req
      return await handler(req, res);
    } catch (e) {
      console.error('Token verification error:', e);
      return res.status(401).json({ error: 'Invalid token', details: e.message || e });
    }
  };
}

module.exports = { withAuth };