const { Pool } = require('pg');
const { requireAuth } = require('../protected/requireAuth');

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

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
    }

    if (req.method === 'GET') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(405).json({ message: 'Faltan datos para obtener usuarios' });
            }

            const result = await pool.query(`
                SELECT u.id, u.nombre, r.id as rol_id, r.nombre as rol_nombre
                FROM users u
                LEFT JOIN user_rol ur ON u.id = ur.id_user
                LEFT JOIN rol r ON ur.id_rol = r.id
                WHERE u.user_padre_id = $1
            `, [id]);

            const rows = result.rows;

            if (!Array.isArray(rows)) {
                return res.status(500).json({ message: 'Error inesperado: rows no es un array' });
            }

            const usuariosMap = new Map();

            rows.forEach(({ id, nombre, rol_id, rol_nombre }) => {
                if (!usuariosMap.has(id)) {
                    usuariosMap.set(id, { id, nombre, roles: [] });
                }
                if (rol_id && rol_nombre) {
                    usuariosMap.get(id).roles.push({ id: rol_id, nombre: rol_nombre });
                }
            });

            const usuarios = Array.from(usuariosMap.values());

            return res.status(200).json({ usuarios });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    } if (req.method === "PUT") {
        try {
            const { id, roles } = req.body[0];

            if (!id) {
                return res.status(400).json({ message: 'Faltan datos para editar usuario' });
            }

            // Eliminar los roles actuales del usuario
            await pool.query('DELETE FROM user_rol WHERE id_user = $1', [id]);

            // Insertar los nuevos roles del usuario, si hay roles
            if (Array.isArray(roles) && roles.length > 0) {
                await Promise.all(
                    roles.map(rol => {
                        return pool.query(`
                        INSERT INTO user_rol (id_user, id_rol)
                        VALUES ($1, $2)
                    `, [id, rol.id]);
                    })
                );
            }

            return res.status(200).json({ message: 'Roles actualizados correctamente' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al modificar usuario' });
        }
    } if (req.method === "DELETE") {
        const { id } = req.query;
        console.log(id);
        if (!id) {
            res.status(500)({ message: 'Faltan datos para eliminar usuario' });
        }
        try {


            await pool.query('DELETE FROM user_rol WHERE id_user = $1', [id]);

            await pool.query('DELETE FROM users WHERE id = $1', [id]);

            res.status(200).json({ message: 'Usuario eliminado con exito' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al eliminar usuario' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};
