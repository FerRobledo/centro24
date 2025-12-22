import pool from '../db.js';
import { requireAuth } from '../protected/requireAuth.js';

export default async function handler(req, res) {
    const origin = req.headers.origin || '*';

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
                return res.status(400).json({ message: 'Faltan datos para obtener usuarios' });
            }

            const result = await pool.query(`
                SELECT u.id, u.nombre, r.id AS rol_id, r.nombre AS rol_nombre
                FROM users u
                LEFT JOIN user_rol ur ON u.id = ur.id_user
                LEFT JOIN rol r ON ur.id_rol = r.id
                WHERE u.user_padre_id = $1
            `, [id]);

            const usuariosMap = new Map();

            result.rows.forEach(({ id, nombre, rol_id, rol_nombre }) => {
                if (!usuariosMap.has(id)) {
                    usuariosMap.set(id, { id, nombre, roles: [] });
                }
                if (rol_id && rol_nombre) {
                    usuariosMap.get(id).roles.push({ id: rol_id, nombre: rol_nombre });
                }
            });

            return res.status(200).json({ usuarios: Array.from(usuariosMap.values()) });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id, roles } = req.body[0];

            if (!id) {
                return res.status(400).json({ message: 'Faltan datos para editar usuario' });
            }

            await pool.query('DELETE FROM user_rol WHERE id_user = $1', [id]);

            if (Array.isArray(roles)) {
                await Promise.all(
                    roles.map(rol =>
                        pool.query(
                            'INSERT INTO user_rol (id_user, id_rol) VALUES ($1, $2)',
                            [id, rol.id]
                        )
                    )
                );
            }

            return res.status(200).json({ message: 'Roles actualizados correctamente' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al modificar usuario' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: 'Faltan datos para eliminar usuario' });
        }

        try {
            await pool.query('DELETE FROM user_rol WHERE id_user = $1', [id]);
            await pool.query('DELETE FROM users WHERE id = $1', [id]);

            return res.status(200).json({ message: 'Usuario eliminado con éxito' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al eliminar usuario' });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}
