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
    const { id } = req.query;


    // GET
    if (req.method === 'GET') {
    }

    if (req.method === 'PUT') {
        const { ...payload } = req.body;

        try {
            const { rows } = await pool.query(
                `UPDATE clientes_mensuales
                 SET tipo = $1,
                     cliente = $2,
                     monto = $3
                 WHERE id_client = $4 AND user_admin = $5
                 RETURNING *;`,
                [payload.tipo, payload.cliente, payload.monto, id, idAdmin]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado o no autorizado' });
            }

            return res.status(200).json(rows[0]);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar cliente', details: error.message });
        }

    }

    // DELETE
    if (req.method === 'DELETE') {

        try {
            const result = await pool.query(
                `UPDATE public.clientes_mensuales 
                     SET activo = false 
                     WHERE id_client = $1 AND user_admin = $2`,
                [id, idAdmin]
            );

            if (result.rowCount > 0) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(404).json({ success: false });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }

    }
}

