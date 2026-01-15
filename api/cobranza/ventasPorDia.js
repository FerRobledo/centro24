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

        if (!id) {
            return res.status(400).json({ error: 'Error falta id para obtener los clientes del dia' });
        }

        try {
            const { date } = req.query;
            let result;
            if (date != '') {
                const { rows } = await pool.query(`
                    SELECT *
                    FROM caja
                    WHERE user_admin = $1 
                    AND DATE(fecha) = $2
                    ORDER BY fecha DESC, id DESC
                    `, [id, date]);

                result = rows;
            } else {
                const { rows } = await pool.query(`
                    SELECT *
                    FROM caja
                    WHERE user_admin = $1 
                    ORDER BY fecha DESC, id DESC
                    `, [id]);
                result = rows;
            }

            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al filtrar ventas por fecha', details: error.message })
        }

    }


    res.status(405).json({ message: 'Método no permitido' });

}
