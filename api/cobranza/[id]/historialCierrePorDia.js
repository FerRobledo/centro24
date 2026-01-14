import pool from '../../db.js';
import { requireAuth } from '../../protected/requireAuth.js';

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

    if (req.method === 'GET') {
        try {
            const { id, date } = req.query;
            const { rows } = await pool.query(`
                    SELECT id, fecha, monto, nombre_usuario
                    FROM public.historial_cierres
                    WHERE user_admin = $1 
                    AND DATE(fecha) = $2
                    ORDER BY fecha DESC, id DESC
                    `, [id, date]);

            return res.status(200).json(rows);

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo obtener detalles', details: error.message });
        }
    }

    res.status(405).json({ message: 'Método no permitido' });

}
