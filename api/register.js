import bcrypt from 'bcryptjs';
import pool from './db.js';


export default async function handler(req, res) {
    const origin = req.headers.origin || '*'; // Usa * si no hay origen

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Manejo de preflight (CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {

            const { username, password, rolesUsuario, idPadre } = req.body;

            // Verificar si el usuario ya existe
            const result = await pool.query('SELECT * FROM users WHERE nombre = $1 and user_padre_id = $2', [username, idPadre]);
            if (result.rows.length > 0) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }

            // Hashear la contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            const userPadreId = idPadre === -1 ? null : idPadre;

            const { rows } = await pool.query(
                'INSERT INTO users (nombre, password_hash, user_padre_id, created_at) VALUES ($1, $2, $3, now()) RETURNING id',
                [username, passwordHash, userPadreId]
            );
            const { id } = rows[0];

            if (rolesUsuario.length > 0) {
                await insertRoles(id, rolesUsuario);
            }

            return res.status(201).json({ message: 'Usuario creado con éxito' });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Error al crear usuario' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};

async function insertRoles(id, rolesUsuario) {
    for (const rol of rolesUsuario) {
        try {
            await pool.query(`
                INSERT INTO user_rol (id_user, id_rol)
                VALUES ($1, $2)
            `, [id, rol.id]);
        } catch (error) {
            console.log(error);
            throw new Error('Error al insertar user_rol');
        }
    }
}
