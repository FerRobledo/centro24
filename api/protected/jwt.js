const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '6h';

function generateToken(user) {
    const token = jwt.sign(
        {
            userId: user.id,
            username: user.nombre,
            idAdmin: user.user_padre_id,
            roles: user.roles,
            fecha_pago_valido: user.fecha_ultimo_pago 
                ? user.fecha_ultimo_pago.toISOString().split('T')[0]
                : null
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return token;
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    generateToken,
    verifyToken
};
