import pool from '../../db.js';
import { requireAuth } from '../../protected/requireAuth.js';

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

    // GET
    if (req.method === 'GET') {
        const { id, page = 1, pageSize = 10, search = '', selectedFiltroPago = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        // id = id_admin
        if (!id) {
            return res.status(400).json({ error: "Debe enviar id (id_admin)" });
        }

        try {
            let where = 'WHERE cm.user_admin = $1 AND cm.activo = true';
            const params = [id];
            let paramIndex = 2;
            console.log(req.query)
            if (search) {
                where += ` AND (
                    CAST(cm.id_client AS TEXT) ILIKE $${paramIndex}
                    OR cm.cliente ILIKE $${paramIndex}
                    OR cm.tipo ILIKE $${paramIndex}
                    )
            `;
                params.push(`%${search}%`);
                paramIndex++;
            }

            if (selectedFiltroPago && selectedFiltroPago != '') {
                if (selectedFiltroPago === 'al-dia') {
                    where += `
                        AND (
                        to_date(pm.periodo_hasta || '-01', 'YYYY-MM-DD')
                        + interval '1 month'
                        - interval '1 day'
                        ) >= CURRENT_DATE
                    `;
                }

                if (selectedFiltroPago === 'atrasado') {
                    where += `
                        AND (
                        to_date(pm.periodo_hasta || '-01', 'YYYY-MM-DD')
                        + interval '1 month'
                        - interval '1 day'
                        ) < CURRENT_DATE
                    `;
                }

                if (selectedFiltroPago === 'sin-pagos') {
                    where += ` AND pm.id IS NULL`;
                }
            }

            // --- Total ---
            const totalQuery = `
            SELECT COUNT(*) 
            FROM clientes_mensuales cm
            LEFT JOIN pagos_mensuales pm ON cm.id_client = pm.id_client
            ${where}
            `;

            const totalResult = await pool.query(totalQuery, params);
            const total = parseInt(totalResult.rows[0].count);
            const dataQuery = `
                SELECT 
                    cm.*,
                    pm.id AS pago_id,
                    pm.periodo_hasta AS pago_hasta
                FROM clientes_mensuales cm
                LEFT JOIN pagos_mensuales pm 
                    ON pm.id_client = cm.id_client
                    AND pm.periodo_hasta = (
                        SELECT MAX(periodo_hasta)
                        FROM pagos_mensuales
                        WHERE id_client = cm.id_client 
                        AND pm.activo = true
                    )
                ${where}
                ORDER BY cm.id_client ASC
                LIMIT $${params.length + 1} 
                OFFSET $${params.length + 2}
                `

            const dataParams = [...params, pageSize, offset];
            const dataResult = await pool.query(dataQuery, dataParams);

            return res.status(200).json({ clientes: dataResult.rows, total });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: 'Error al obtener datos',
                details: error.message
            });
        }
    }
    // POST
    if (req.method === 'POST') {
        const { id } = req.query;

        const payload = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Error falta id para insertar usuario' });
        }
        try {
            const { rows } = await pool.query(
                `INSERT INTO public.clientes_mensuales
                    (tipo, cliente, monto, user_admin, activo)
                    VALUES ($2, $3, $4, $1, true) RETURNING *`,
                [id, payload.tipo, payload.cliente, payload.monto]
            );
            return res.status(201).json(rows[0]);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
        }

    }

    if (req.method === 'PUT') {
        const { idClient, ...payload } = req.body;
        const idAdmin = req.query.id;

        if (!idAdmin) {
            return res.status(400).json({ error: 'Error falta id ' });
        }

        if (!idClient) {
            return res.status(400).json({ error: 'Falta id del cliente para actualizar' });
        }
        try {
            const { rows } = await pool.query(
                `UPDATE clientes_mensuales
                 SET tipo = $1,
                     cliente = $2,
                     monto = $3
                 WHERE id_client = $4 AND user_admin = $5
                 RETURNING *;`,
                [payload.tipo, payload.cliente, payload.monto, idClient, idAdmin]
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
        const idAdmin = req.query.id;
        const { idClient } = req.body;

        // Movido a /pagosMensuales/[idAdmin]/[idPago].js, action pasa a ser req.method === 'DELETE'

        // if (action === 'deletePago') {
        //     if (!id) {
        //         return res.status(400).json({ error: "Faltan datos para eliminar el pago" });
        //     }
        //     try {
        //         await pool.query(`DELETE FROM pagos_mensuales WHERE id = $1 AND id_admin = $2`, [id, idAdmin]);
        //         return res.status(200).json({ success: true });
        //     } catch (error) {
        //         console.log(error);
        //         return res.status(500).json({ error: 'Error no se pudo eliminar el pago', details: error.message });
        //     }
        // } else {

        if (!idAdmin || !idClient) {
            return res.status(400).json({ error: 'Falta idAdmin o idClient' });
        }
        try {
            const result = await pool.query(
                `UPDATE public.clientes_mensuales 
                     SET activo = false 
                     WHERE id_client = $1 AND user_admin = $2`,
                [idClient, idAdmin]
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

