const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Definir en Vercel
    ssl: { rejectUnauthorized: false }, // Necesario si usas PostgreSQL en la nube
});

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*'; // Usa * si no hay origen

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Manejo de preflight (CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method == 'GET') {
        const action = req.query.action;
        if (action == 'validarToken') {
            const token = req.headers.authorization?.split(' ')[1];
            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                return res.status(200).json({ valid: true });
            } catch (err) {
                return res.status(401).json({ valid: false });
            }
        }
    }

    if (req.method === 'POST') {
        const { username, password } = req.body;
        try {
            // Verificar si el usuario existe en la base de datos
            const result = await pool.query(`
                    SELECT 
                    u.id , u.nombre, u.password_hash, u.user_padre_id,
                    array_agg(r.nombre) AS roles
                    FROM users u
                    INNER JOIN user_rol ur ON u.id = ur.id_user
                    INNER JOIN rol r ON r.id = ur.id_rol
                    WHERE u.nombre = $1
                    GROUP BY u.id , u.nombre, u.password_hash, u.user_padre_id;
                    `, [username]);
            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            const user = result.rows[0];
            // Verificar la contraseña
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            // Generar el JWT
            const token = jwt.sign(
                { userId: user.id, username: user.nombre, idAdmin: user.user_padre_id, roles: user.roles },
                process.env.JWT_SECRET,
                { expiresIn: '12h' } // El token expira en 12 horas
            );

            return res.status(200).json({ token });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al iniciar sesion' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};
