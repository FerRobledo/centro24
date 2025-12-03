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

        // id = id_admin
        if (!id) {
            return res.status(400).json({ error: "Debe enviar id (id_admin)" });
        }

        try {
            let where = `WHERE cm.user_admin = $1 AND cm.estado = 'Activo'`;
            let params = [id];


            // ESTO ES IMPORTANTE PARA AGREGAR $1, $2, SEGUN LA CANTIDAD DE PARAMETROS QUE TENGAN
            // ESTA BUENO PARA UNA CONSULTA QUE TENGA MUCHOS FILTROS DE FORMA DINAMICA
            // WHERE nombre = $1 AND localidad = $2
            // WHERE localidad = $1, en el caso de que no venga nombre por parametros (es solo un ejemplo de como se puede aplicar)
            // EN ESTE CASO NO TENEMOS FILTROS DINAMICOS XD
            let paramsIndex = 2;

            // // Si tuvieramos un filtro dinamico podriamos hacer:
            // if(filtro){

            // SE USA `` PARA QUE LOS ESPACIOS LOS TOME DE FORMA LITERAL

            //     where += ` AND cm.filtro = $${i}`
            //     params.push(filtro);

            // DESPUES DE MODIFICAR EL WHERE AUMENTAMOS EL paramIndex POR SI HAY MAS FILTROS

            //     paramIndex++;
            // }

            const query = `
            SELECT 
                cm.*
            FROM clientes_mensuales cm
            LEFT JOIN pagos_mensuales pm 
                ON cm.id_client = pm.id_client 
            ${where}
            ORDER BY cm.id_client ASC, pm.fecha_pago DESC
        `;

            const { rows } = await pool.query(query, params);

            // Agrupar por cliente
            const clientesMap = {};

            for (const row of rows) {
                const idClient = row.id_client;

                if (!clientesMap[idClient]) {
                    clientesMap[idClient] = {
                        ...row,
                        pagos: []
                    };
                }

                if (row.id_pago) {
                    clientesMap[idClient].pagos.push({
                        id_pago: row.id_pago,
                        fecha_pago: row.fecha_pago,
                        monto: row.monto,
                        mes: row.mes
                    });
                }
            }

            return res.status(200).json(Object.values(clientesMap));

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
        const { accion } = req.body;
        const { id } = req.query;

        if (accion === 'addPago') {
            const { infoPago } = req.body;

            // Validar método de pago conocido
            const allowedMetodos = ['Efectivo', 'Debito', 'Credito', 'Transferencia', 'Cheque'];
            const metodo = infoPago.metodoPago;
            if (!allowedMetodos.includes(metodo)) {
                return res.status(400).json({ error: 'Método de pago inválido' });
            }

            try {
                await pool.query(
                    `
                    INSERT INTO pagos_mensuales
                    (id_client, fecha_pago, monto, periodo_desde, periodo_hasta, id_admin, estado, metodo_pago)
                    VALUES ($1, now(), $2, $3, $4, $5, $6, $7)
                    `, [infoPago.client, infoPago.monto, infoPago.fechaDesde, infoPago.fechaHasta, id, 'false', metodo]
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
                    (tipo, cliente, monto, user_admin)
                    VALUES ($2, $3, $4, $1) RETURNING *`,
                    [id, payload.tipo, payload.cliente, payload.monto]
                );
                return res.status(201).json(rows[0]);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
            }
        }
    }

    if (req.method === 'PUT') {
        const { accion, porcentaje, idClient, ...payload } = req.body;
        const idAdmin = req.query.id;

        if (!idAdmin) {
            return res.status(400).json({ error: 'Error falta id ' });
        }

        if (accion === 'incrementar') {
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
        } else {
            if (!idClient) {
                return res.status(400).json({ error: 'Falta id del cliente para actualizar' });
            }
            try {
                const { rows } = await pool.query(
                    `UPDATE public.clientes_mensuales
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
    }

    // DELETE
    if (req.method === 'DELETE') {
        const idAdmin = req.query.id;
        const { action, id, idClient } = req.body;

        if (action === 'deletePago') {
            if (!id) {
                return res.status(400).json({ error: "Faltan datos para eliminar el pago" });
            }
            try {
                await pool.query(`DELETE FROM pagos_mensuales WHERE id = $1 AND id_admin = $2`, [id, idAdmin]);
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
                const result = await pool.query(
                    `UPDATE public.clientes_mensuales 
                     SET estado = 'Desactivo' 
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

