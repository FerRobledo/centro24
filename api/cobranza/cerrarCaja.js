import pool from '../db.js';
import { requireAuth } from '../protected/requireAuth.js';

export default async function handler(req, res) {
    const origin = req.headers.origin || '*';

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
    }

    const { idAdmin, username = '' } = req.user;

    if (req.method === 'GET') {
        try {

            const result = await pool.query(`
            SELECT 
                'caja' AS tipo,
                COUNT(*) AS cantidad,
                COALESCE(SUM(efectivo + debito + credito + transferencia + cheque - gasto),0) AS total
            FROM caja
            WHERE user_admin = $1 AND activo = true and cerrado = false

            UNION ALL

            SELECT 
                'pagos_mensuales' AS tipo,
                COUNT(*) AS cantidad,
                COALESCE(SUM(monto),0) AS total
            FROM pagos_mensuales
            WHERE id_admin = $1 and cerrado = false
            `, [idAdmin]);

            const resumen = {
                caja: result.rows.find(r => r.tipo === 'caja'),
                pagos_mensuales: result.rows.find(r => r.tipo === 'pagos_mensuales')
            };

            console.log(resumen);

            return res.status(200).json({
                caja: {
                    cantidad: Number(resumen.caja.cantidad),
                    total: Number(resumen.caja.total)
                },
                pagos_mensuales: {
                    cantidad: Number(resumen.pagos_mensuales.cantidad),
                    total: Number(resumen.pagos_mensuales.total)
                },
                total_general:
                    Number(resumen.caja.total) + Number(resumen.pagos_mensuales.total)
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al obtener datos sobre cierre de caja' })
        }

    }

    if (req.method === 'POST') {

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const [{ total_caja }, { total_pagos }] = await Promise.all([
                client.query(`
                SELECT COALESCE(SUM(efectivo + debito + credito + transferencia + cheque - gasto),0) AS total_caja
                FROM caja
                WHERE user_admin = $1 AND cerrado = false AND activo = true
            `, [idAdmin]).then(r => r.rows[0]),

                client.query(`
                SELECT COALESCE(SUM(monto),0) AS total_pagos
                FROM pagos_mensuales
                WHERE id_admin = $1 AND cerrado = false
            `, [idAdmin]).then(r => r.rows[0])
            ]);

            const total = Number(total_caja) + Number(total_pagos);

            const cierre = await client.query(`
            INSERT INTO historial_cierres (fecha, user_admin, monto, nombre_usuario)
            VALUES (now(), $1, $2, $3)
            RETURNING id
        `, [idAdmin, total, username.trim()]);

            const idCierre = cierre.rows[0].id;

            // Insert masivo desde caja
            await client.query(`
            INSERT INTO detalle_cierre (id_cierre, fuente, id_origen, monto)
            SELECT $1, 'caja', id, (efectivo + debito + credito + transferencia + cheque - gasto)
            FROM caja
            WHERE user_admin = $2 AND cerrado = false AND activo = true
        `, [idCierre, idAdmin]);

            // Insert masivo desde pagos
            await client.query(`
            INSERT INTO detalle_cierre (id_cierre, fuente, id_origen, monto)
            SELECT $1, 'pagos_mensuales', id, monto
            FROM pagos_mensuales
            WHERE id_admin = $2 AND cerrado = false
        `, [idCierre, idAdmin]);

            await client.query(`
            UPDATE caja SET cerrado = true
            WHERE user_admin = $1 AND cerrado = false
        `, [idAdmin]);

            await client.query(`
            UPDATE pagos_mensuales SET cerrado = true
            WHERE id_admin = $1 AND cerrado = false
        `, [idAdmin]);

            await client.query('COMMIT');

            return res.status(200).json({ total });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al cerrar caja:', error);
            return res.status(500).json({ error: 'No se pudo cerrar la caja' });
        } finally {
            client.release();
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });

}
