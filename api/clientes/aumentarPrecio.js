import pool from '../db.js';
import { requireAuth } from '../protected/requireAuth.js';

export default async function handler(req, res) {
    const origin = req.headers.origin || '*';

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    const idAdmin = req.user.idAdmin;

    if (req.method === 'PUT') {
        const { porcentaje } = req.body;

        if (!idAdmin) {
            return res.status(400).json({ error: 'Error falta id ' });
        }

        try {
            const { rows } = await pool.query(
                `UPDATE public.clientes_mensuales
                        SET monto = ROUND((monto + (monto * $1 / 100)) / 1000.0) * 1000
                        WHERE user_admin = $2
                        RETURNING *;`,
                [porcentaje, idAdmin]
            );
            return res.status(200).json(rows);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al incrementar monto mensual', details: error.message });
        }
    }
}

