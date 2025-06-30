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
                const pagos = await getPagos(row.id_client);
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
        if (accion === 'addPago') {
            const { infoPago } = req.body;
            try {
                await pool.query(
                    `
                    INSERT INTO pagos_mensuales
                    (id_client, fecha_pago, monto, periodo_desde, periodo_hasta)
                    VALUES ($1, now(), $2, $3, $4)
                    `, [infoPago.idClient, infoPago.monto, infoPago.fechaDesde, infoPago.fechaHasta]
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
                    " VALUES ($2, $3, $4, $5, $6, $1, $7)", [id, payload.tipo, payload.cliente, payload.mensual, payload.bonificacion, payload.monto]
                );
                return res.status(200).json(rows);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
            }
        }
    }


    //PUT
    if (req.method === 'PUT') {
        const idClient = req.query.id;
        const { idAdmin } = req.body; //con { } extrae solo idAdmin del body recibido.
        const payload = req.body; //sin { } guarda todo el body (con todas sus propiedades).

        if (!idClient) {
            return res.status(500).json({ error: 'Error falta id para actualizar usuario', details: 'No se recibió el ID en el cuerpo de la petición' });
        } try {
            const { rows } = await pool.query(
                "UPDATE public.clientes_mensuales" +
                " SET tipo=$1, cliente=$2, mensual=$3, bonificacion=$4, user_admin=$6, monto=$7" +
                " WHERE id_client=$8;", [payload.tipo, payload.cliente, payload.mensual, payload.bonificacion, idAdmin, payload.monto, idClient]
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
                'DELETE FROM public.clientes_mensuales WHERE id_client=$1 and user_admin=$2 RETURNING id_client;',
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

async function getPagos(id_cliente) {
    const query = `
        SELECT *  
        FROM pagos_mensuales
        WHERE id_client = $1
        ORDER BY fecha_pago DESC
    `;
    const { rows } = await pool.query(query, [id_cliente]);
    return rows;
}
