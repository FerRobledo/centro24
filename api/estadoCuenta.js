import pool from './db.js';
import { requireAuth } from './protected/requireAuth.js';

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

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (error) {
        return res.status(401).json({ error: 'No autorizado', details: error.message });
    }

    if (req.method == 'GET') {
        try {
            const idAdmin = req.user.idAdmin;
            const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [idAdmin]);
            const rows = result.rows;

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' })
            }

            const user = rows[0]


            // 4️⃣ Calcular fechas
            const hoy = new Date()
            const vencimiento = new Date(user.fecha_ultimo_pago)

            const diffMs = vencimiento - hoy
            const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

            // 5️⃣ Estado
            let estado = 'ACTIVO'
            if (diasRestantes <= 0) estado = 'VENCIDO'
            else if (diasRestantes <= 10) estado = 'POR_VENCER'

            // 6️⃣ Respuesta
            return res.status(200).json({
                estado,
                diasRestantes,
                fechaVencimiento: vencimiento
            })

        } catch (err) {
            console.log(err);
            return res.status(401).json({});
        }

    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};
