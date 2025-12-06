import { verifyToken } from './jwt.js';

export function requireAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('No token provided');
  }
  const token = authHeader.replace('Bearer ', '');
  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    throw new Error('Token inválido o expirado');
  }
  // Puedes agregar más validaciones si querés (por ejemplo, chequear usuario en DB)
  return { userId: payload.id, username: payload.username };
}
