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
    //GET
    if (req.method === 'GET') {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Error falta id para obtener los clientes del dia', details: error.message });
        }
        try {
            const { rows } = await pool.query('SELECT * FROM clientes_mensuales WHERE user_admin = $1', [id]);

            for (let row of rows) {
                const pagos = await getPagos(row.id_client, id);
                row.pagos = pagos;
            }

            return res.status(200).json(rows);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo obtener los clientes del dia', details: error.message });
        }
    }

    //POST
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
                )
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error no se pudo insertar el pago', details: error.message });
            }
        } else {

            const { id } = req.query;
            const payload = req.body;
            if (!id) {
                return res.status(500).json({ error: 'Error falta id para insertar usuario', details: 'No se recibió el ID en el cuerpo de la petición' });

            } try {
                const { rows } = await pool.query(
                    "INSERT INTO public.clientes_mensuales" +
                    " (tipo, cliente, mensual, bonificacion, user_admin, monto)" +
                    " VALUES ($2, $3, $4, $5, $1, $6)", [id, payload.tipo, payload.cliente, payload.mensual, payload.bonificacion, payload.monto]
                );
                console.log(rows);
                return res.status(200).json(rows);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
            }
        }
    }

    if (req.method === 'PUT') {
        const { accion, porcentaje, ...payload } = req.body;
        const idAdmin = req.query.id;

        if (!idAdmin) {
            return res.status(500).json({
                error: 'Error falta id para actualizar usuario',
                details: 'No se recibió el ID en la URL',
            });
        }

        if (accion === 'incrementar') {
            try {
                const { rowCount } = await pool.query(
                    `UPDATE public.clientes_mensuales
                    SET monto = ROUND(monto + (monto * $1 / 100), 2)
                    WHERE user_admin = $2;`,
                    [porcentaje, idAdmin]
                );

                return res.status(200).json({
                    message: `Incremento del ${porcentaje}% aplicado correctamente.`,
                    updated: rowCount,
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    error: 'Error no se pudo actualizar el incremento',
                    details: error.message,
                });
            }
        } else {
            // code para actualizar UN cliente
            const idClient = req.query.id;
            if (!idClient) {
                return res.status(500).json({
                    error: 'Error falta id para actualizar usuario individual',
                    details: 'No se recibió el ID del cliente',
                });
            }

            try {
                const { rows } = await pool.query(
                    `UPDATE public.clientes_mensuales
                    SET tipo = $1,
                        cliente = $2,
                        mensual = $3,
                        bonificacion = $4,
                        monto = $5
                    WHERE id_client = $6 AND user_admin = $7;`,
                    [
                        payload.tipo,
                        payload.cliente,
                        payload.mensual,
                        payload.bonificacion,
                        payload.monto,
                        idClient,
                        idAdmin,
                    ]
                );
                return res.status(200).json(rows);
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    error: 'Error no se pudo actualizar el cliente',
                    details: error.message,
                });
            }
        }
    }

    // DELETE 
    if (req.method === 'DELETE') {
        const idAdmin = req.query.id;
        const { idClient } = req.body;

        if (!idAdmin || !idClient) {
            return res.status(400).json({ error: 'Falta idAdmin o idAdmin' });
        }

        try {
            const { rows } = await pool.query(
                'DELETE FROM public.clientes_mensuales WHERE id_client=$1 and user_admin=$2 RETURNING id_client;',
                [idClient, idAdmin]
            );

            if (rows.length > 0) {
                return res.status(200).json({ success: true, deletedId: rows[0].id_client});
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

    // GET MES CLIENT
    if (req.method === 'GET') {
        const month = req.query.monthSelected;

        if (!month) {
            return res.status(400).json({
                error: 'Error falta mes',
                details: 'No se recibió el mes necesario',
            });
        }

        try {
            const { rows } = await pool.query(
                `
        SELECT * 
        FROM public.clientes_mensuales cm
        JOIN public.pagos_mensuales pm 
          ON cm.id_client = pm.id_client
        WHERE pm.mes = $1
        `,
                [month]
            );

            res.json(rows);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: 'Error no se pudo obtener los clientes del mes',
                details: error.message,
            });
        }
    }
}


async function getPagos(id_cliente, id_admin) {
    const query = `
        SELECT *  
        FROM pagos_mensuales
        WHERE id_client = $1 and id_admin = $2
        ORDER BY fecha_pago DESC
    `;
    const { rows } = await pool.query(query, [id_cliente, id_admin]);
    return rows;
}


