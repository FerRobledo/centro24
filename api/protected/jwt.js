import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '6h';

export function generateToken(user) {
    const token = jwt.sign(
        { userId: user.id, username: user.nombre, idAdmin: user.user_padre_id, roles: user.roles, fecha_pago_valido: user.fecha_ultimo_pago.toISOString().split('T')[0] },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } // El token expira en 6 horas
    );

    return token
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
