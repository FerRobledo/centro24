require('dotenv/config');
const { withAuth } = require('./authMiddleware');

const handler = async (req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method === 'GET') {
    // req.user ya está seteado por el middleware
    return res.json({
      message: '¡Acceso concedido! Token válido.',
      userId: req.user.userId
    });
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
};

module.exports = withAuth(handler);