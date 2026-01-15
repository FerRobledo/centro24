import pool from '../db.js';
import { requireAuth } from '../protected/requireAuth.js';

export default async function handler(req, res) {
    const origin = req.headers.origin || '*';

    //seteo los encabzados para http
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    //le pregunto al back si puedo usar PUT,POST,... con el OPTIONS
    //retorno si, los podes usar
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
    }
    const id = req.user.idAdmin;

    if (req.method === 'GET') {
        try {
            const result = await pool.query(`
                        SELECT id, fecha, monto, nombre_usuario
                        FROM public.historial_cierres
                        WHERE user_admin = $1
                        ORDER BY fecha DESC;
                        `, [id]);

            return res.status(200).json(result.rows);

        } catch (error) {

            console.error('error al obtener historial de caja:', error);
            return res.status(500).json({ error: 'Error no se pudo obtener el historial de caja', details: error.message });

        }
    }

    res.status(405).json({ message: 'Método no permitido' });
}
