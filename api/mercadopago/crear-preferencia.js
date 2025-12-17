import pool from '../db.js';
import { crearPreferencia } from '../mercadoPagoService.js';
import { requireAuth } from '../protected/requireAuth.js';

export default async function handler(req, res) {
    console.log("dsfas")
    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
    }

    const origin = req.headers.origin || '*'; // Usa * si no hay origen

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const { userId } = req.body;

    try {
        const { rows } = await pool.query('SELECT * FROM mercado_pago WHERE id = 1');
        const datosMp = rows[0];
        if (!datosMp) {
            return res.status(404).json({ error: 'Datos no encontrados' });
        }
        // Llamamos al servicio para crear la preferencia
        const { initPoint } = await crearPreferencia(datosMp, userId);
        res.json({ initPoint });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creando preferencia' });
    }
};