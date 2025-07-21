const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*';

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET
    if (req.method === 'GET') {
        const { id, monthSelected } = req.query;

        if (id) {
            // Obtener clientes con pagos para admin dado
            try {
                // Obtener clientes
                const { rows: clientes } = await pool.query('SELECT * FROM clientes_mensuales WHERE user_admin = $1', [id]);

                // Extraer los ids de clientes para buscar sus pagos
                const idsClientes = clientes.map(c => c.id_client);

                if (idsClientes.length === 0) {
                    // No hay clientes, responder vacío
                    return res.status(200).json([]);
                }

                // Obtener pagos de todos los clientes en un solo query
                const { rows: pagos } = await pool.query(`
                    SELECT * FROM pagos_mensuales 
                    WHERE id_client = ANY($1) AND id_admin = $2
                    ORDER BY fecha_pago DESC
                    `, [idsClientes, id]);

                // Asociar pagos a cada cliente
                const pagosPorCliente = pagos.reduce((acc, pago) => {
                    if (!acc[pago.id_client]) acc[pago.id_client] = [];
                    acc[pago.id_client].push(pago);
                    return acc;
                }, {});

                // Agregar los pagos a cada cliente
                clientes.forEach(cliente => {
                    cliente.pagos = pagosPorCliente[cliente.id_client] || [];
                });

                return res.status(200).json(clientes);

            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error no se pudo obtener los clientes del dia', details: error.message });
            }
        } else if (monthSelected) {
            // Obtener clientes con pagos para mes dado
            try {
                const { rows } = await pool.query(
                    `
                    SELECT * 
                    FROM public.clientes_mensuales cm
                    JOIN public.pagos_mensuales pm 
                      ON cm.id_client = pm.id_client
                    WHERE pm.mes = $1
                    `,
                    [monthSelected]
                );

                return res.status(200).json(rows);
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    error: 'Error no se pudo obtener los clientes del mes',
                    details: error.message,
                });
            }
        } else {
            return res.status(400).json({ error: 'Debe especificar parámetro id o monthSelected en query' });
        }
    }

    // POST
    if (req.method === 'POST') {
        const { accion } = req.body;
        const { id } = req.query;

        if (accion === 'addPago') {
            const { infoPago } = req.body;
            console.log(infoPago);
            try {
                await pool.query(
                    `
                    INSERT INTO pagos_mensuales
                    (id_client, fecha_pago, monto, periodo_desde, periodo_hasta, id_admin)
                    VALUES ($1, now(), $2, $3, $4, $5)
                    `, [infoPago.client.id_client, infoPago.monto, infoPago.fechaDesde, infoPago.fechaHasta, id]
                );
                return res.status(201).json({ success: true });
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error no se pudo insertar el pago', details: error.message });
            }
        } else {
            const payload = req.body;
            if (!id) {
                return res.status(400).json({ error: 'Error falta id para insertar usuario' });
            }
            try {
                const { rows } = await pool.query(
                    `INSERT INTO public.clientes_mensuales
                    (tipo, cliente, mensual, bonificacion, user_admin, monto)
                    VALUES ($2, $3, $4, $5, $1, $6) RETURNING *`,
                    [id, payload.tipo, payload.cliente, payload.mensual, payload.bonificacion, payload.monto]
                );
                console.log(rows);
                return res.status(201).json(rows[0]);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
            }
        }
    }

    // PUT
    if (req.method === 'PUT') {
        const idClient = req.query.id;
        const { idAdmin } = req.body;
        const payload = req.body;

        if (!idClient) {
            return res.status(400).json({ error: 'Error falta id para actualizar usuario' });
        }
        try {
            const { rows } = await pool.query(`
                UPDATE public.clientes_mensuales
                SET tipo = $1,
                    cliente = $2,
                    mensual = $3,
                    bonificacion = $4,
                    monto = $5
                WHERE id_client = $6 AND user_admin = $7
                RETURNING *;
            `, [payload.tipo, payload.cliente, payload.mensual, payload.bonificacion, payload.monto, idClient, idAdmin]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado o no autorizado' });
            }

            return res.status(200).json(rows[0]);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo actualizar el cliente', details: error.message });
        }
    }

    // DELETE
    if (req.method === 'DELETE') {
        const idAdmin = req.query.id;
        const { accion, idClient, pago } = req.body;

        if (accion === 'deletePago') {
            if (!pago) {
                return res.status(400).json({ error: "Faltan datos para eliminar el pago" });
            }
            try {
                await pool.query(
                    `DELETE FROM pagos_mensuales WHERE id= $1 AND id_admin = $2`,
                    [pago.id, pago.id_admin]
                );
                return res.status(200).json({ success: true });
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error no se pudo eliminar el pago', details: error.message });
            }
        } else {
            if (!idAdmin || !idClient) {
                return res.status(400).json({ error: 'Falta idAdmin o idClient' });
            }
            try {
                const { rows } = await pool.query(
                    'DELETE FROM public.clientes_mensuales WHERE id_client=$1 AND user_admin=$2 RETURNING id_client;',
                    [idClient, idAdmin]
                );

                if (rows.length > 0) {
                    return res.status(200).json({ success: true, deletedId: rows[0].id_client });
                } else {
                    return res.status(404).json({ success: false, message: 'Cliente no encontrado o no autorizado' });
                }
            } catch (error) {
                console.error(error);

                if (error.code === '23503') {
                    return res.status(409).json({
                        error: 'No se puede eliminar el cliente porque tiene pagos registrados.',
                        detail: error.detail
                    });
                }

                return res.status(500).json({
                    error: 'Error en la eliminación',
                    detail: error.message
                });
            }
        }
    }

    // Si no es ninguno de los métodos soportados
    res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
};
