const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
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

    if (req.method === 'GET') {
        const { id, action, nameUser, idCierre } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Error falta id para obtener los clientes del dia' });
        }

        if (action === 'close') {
            try {
                const result1 = await pool.query(`
                        SELECT SUM(efectivo + debito + credito + transferencia + cheque - gasto) AS total_caja
                        FROM caja
                        WHERE user_admin = $1 AND estado = false
                    `, [id]);

                const result2 = await pool.query(`
                        SELECT SUM(monto) AS total_pagos
                        FROM pagos_mensuales
                        WHERE id_admin = $1 AND estado = false
                    `, [id]);

                const totalCaja = parseFloat(result1.rows[0]?.total_caja ?? 0);
                const totalPagos = parseFloat(result2.rows[0]?.total_pagos ?? 0);
                const total = totalCaja + totalPagos;

                const cierreInsert = await pool.query(`
                        INSERT INTO historial_cierres (fecha, user_admin, monto, nombre_usuario)
                        VALUES (CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires', $1, $2, $3)
                        RETURNING id
                    `, [id, total, (nameUser || '').trim()]);

                const idCierre = cierreInsert.rows[0]?.id;

                if (!idCierre) throw new Error('no se pudo obtener el id del cierre');

                //selecciono todos los detalles de la caja con estado=false y lo agrego a la intermedia
                const cajaDetalle = await pool.query(`
                            SELECT id, (efectivo + debito + credito + transferencia + cheque - gasto) AS monto
                            FROM caja
                            WHERE user_admin = $1 AND estado = false
                        `, [id]);

                for (const row of cajaDetalle.rows) {
                    if (row.id == null || row.monto == null) {
                        console.warn('fila incompleta en caja:', row);
                        continue;
                    }
                    await pool.query(`
                                INSERT INTO detalle_cierre (id_cierre, fuente, id_origen, monto)
                                VALUES ($1, 'caja', $2, $3)
                            `, [idCierre, row.id, row.monto]);
                }

                //selecciono detalles de los pagos mensuales con estado=false y lo agrego a la intermedia
                const pagosDetalle = await pool.query(`
                            SELECT id, monto FROM pagos_mensuales
                            WHERE id_admin = $1 AND estado = false
                        `, [id]);

                for (const row of pagosDetalle.rows) {
                    if (row.id == null || row.monto == null) {
                        console.warn('fila incompleta en pagos_mensuales:', row);
                        continue;
                    }
                    await pool.query(`
                                INSERT INTO detalle_cierre (id_cierre, fuente, id_origen, monto)
                                VALUES ($1, 'pagos_mensuales', $2, $3)
                            `, [idCierre, row.id, row.monto]);
                }
                //marco las tuplas que tengan false como true
                await pool.query(`UPDATE caja SET estado = true WHERE user_admin = $1 AND estado = false`, [id]);
                await pool.query(`UPDATE pagos_mensuales SET estado = true WHERE id_admin = $1 AND estado = false`, [id]);

                return res.status(200).json({ total });

            } catch (error) {
                console.error('error al cerrar caja:', error);
                return res.status(500).json({ error: 'Error no se pudo cerrar la caja', details: error.message });
            }
        } else if (action === 'history') {
            try {
                const result = await pool.query(`
                        SELECT id, fecha, monto, nombre_usuario
                        FROM public.historial_cierres
                        WHERE user_admin = $1;
                        `, [id]);

                return res.status(200).json(result.rows);

            } catch (error) {

                console.error('error al obtener historial de caja:', error);
                return res.status(500).json({ error: 'Error no se pudo obtener el historial de caja', details: error.message });

            }
        } else if (action === 'details') {
            try {

                const { rows } = await pool.query(`
                    SELECT dc.fuente, dc.id_origen 
                    FROM detalle_cierre dc
                    JOIN historial_cierres hc on dc.id_cierre = hc.id
                    WHERE dc.id_cierre = $2 AND hc.user_admin = $1
                    `, [id, idCierre])

                const mapeo = Object.values(
                    rows.reduce((acc, { fuente, id_origen }) => {
                        if (!acc[fuente]) {
                            acc[fuente] = { fuente, id: [] };
                        }
                        acc[fuente].id.push(id_origen);
                        return acc;
                    }, {})
                );

                let data = [];

                for (const { fuente, id } of mapeo) {
                    let sql;
                    if (fuente === "pagos_mensuales") {
                        sql = `SELECT f.monto, f.fecha_pago AS fecha, cm.cliente as detalle
                            FROM ${fuente} f
                            JOIN clientes_mensuales cm ON f.id_client = cm.id_client
                            WHERE f.id IN (${id.join(", ")});`;
                    } else {
                        sql = `SELECT * FROM ${fuente} WHERE id IN (${id.join(", ")});`;
                    }

                    let resultSQL = await pool.query(sql);

                    // 🔹 Agrego la fuente a cada registro antes de acumular
                    resultSQL = resultSQL.rows.map(row => ({
                        ...row,
                        fuente
                    }));

                    // Acumulo resultados en data
                    data.push(...resultSQL);
                }

                // 🔹 Ordenar resultados por fecha (ajustá el campo de fecha real, por ej. "fecha")
                data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));


                return res.status(200).json({ data });
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error no se pudo obtener detalles', details: error.message });
            }
        } else if (action === 'getClientsByDate') {
            try {
                const { id, date } = req.query;
                console.log(date);
                const { rows } = await pool.query(`
                    SELECT * 
                    FROM caja 
                    WHERE user_admin = $1 
                    AND DATE(fecha) = $2
                    ORDER BY fecha DESC, id DESC
                    `, [id, date]);

                return res.status(200).json(rows);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error al filtrar ventas por fecha', details: error.message })
            }
        } else if (action === 'getHistorialByDate') {
            try {
                const { id, date } = req.query;
                console.log(date);
                const { rows } = await pool.query(`
                    SELECT id, fecha, monto, nombre_usuario
                    FROM public.historial_cierres
                    WHERE user_admin = $1 
                    AND DATE(fecha) = $2
                    ORDER BY fecha DESC, id DESC
                    `, [id, date]);

                return res.status(200).json(rows);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error al filtrar ventas por fecha', details: error.message })
            }
        }
        else {

            const { rows } = await pool.query(`
                SELECT * FROM caja WHERE user_admin = $1 ORDER BY fecha DESC, id DESC
                `, [id]);

            return res.status(200).json(rows);
        }

    }


    //POST
    if (req.method === 'POST') {
        const { id } = req.query;
        const payload = req.body;

        if (!id) {
            return res.status(400).json({
                error: 'Falta id para insertar usuario',
                details: 'No se recibió el ID en la petición',
            });
        }

        try {
            // 1. Defino mapping de tipos → columnas
            const columnasPagos = {
                Efectivo: "efectivo",
                Debito: "debito",
                Credito: "credito",
                Transferencia: "transferencia",
                Cheque: "cheque",
                Gasto: "gasto",
            };

            // 2. Inicializo todas en 0
            const valoresPagos = {};
            Object.values(columnasPagos).forEach((col) => (valoresPagos[col] = 0));

            // 3. Cargo lo que vino en payload.pagos
            if (Array.isArray(payload.pagos)) {
                payload.pagos.forEach((p) => {
                    const columna = columnasPagos[p.tipo];
                    if (columna) {
                        valoresPagos[columna] = p.monto;
                    }
                });
            }

            // 4. Query con todas las columnas
            const query = `
                INSERT INTO public.caja
                    (fecha, detalle, observacion, efectivo, debito, credito, transferencia, cheque, gasto, user_admin)
                VALUES
                    (CURRENT_DATE, $1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *;
                `;

            // 5. Armado de parámetros
            const values = [
                payload.detalle || null,
                payload.observacion || null,
                valoresPagos.efectivo,
                valoresPagos.debito,
                valoresPagos.credito,
                valoresPagos.transferencia,
                valoresPagos.cheque,
                valoresPagos.gasto,
                id,
            ];
            const { rows } = await pool.query(query, values);
            return res.status(201).json(rows[0]);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Error al insertar en caja",
                details: error.message,
            });
        }
    }
    //PUT
    if (req.method === 'PUT') {
        const idClient = req.query.id;
        const { idAdmin } = req.body; //el {} quiere decir del objeto req.body, extraeme la propiedad llamada idAdmin
        const payload = req.body; //sin {} porque es un objeto, los objetos se toman completos

        if (!idClient) {
            return res.status(500).json({ error: 'Error falta id para actualizar usuario', details: 'No se recibió el ID en el cuerpo de la petición' });
        } try {
            const { rows } = await pool.query(
                "UPDATE public.caja" +
                " SET detalle=$1, efectivo=$2, debito=$3, credito=$4, transferencia=$5, cheque=$6, observacion=$7, gasto=$8, user_admin=$9" +
                " WHERE id=$10;", [payload.detalle, payload.efectivo, payload.debito, payload.credito, payload.transferencia, payload.cheque, payload.observacion, payload.gasto, idAdmin, idClient]
            );

            return res.status(200).json(rows);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo actualizar el cliente', details: error.message });
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
                'DELETE FROM public.caja WHERE id=$1 and user_admin=$2 RETURNING id;',
                [idClient, idAdmin]
            );

            if (rows.length > 0) {
                return res.status(200).json({ success: true, deletedId: rows[0].id });
            } else {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado o no autorizado' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la eliminación', detail: error.message });
        }
    }
}
