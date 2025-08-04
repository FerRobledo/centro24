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
        const { id, action, nameUser } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Error falta id para obtener los clientes del dia' });
        }
    
        try {
            if (action === 'close') {
                const result1 = await pool.query(`
                    SELECT SUM(efectivo + debito + credito + transferencia + cheque + gasto) AS total_caja
                    FROM caja
                    WHERE user_admin = $1 AND estado = $2
                `, [id, 'false']);
    
                const result2 = await pool.query(`
                    SELECT SUM(monto) AS total_pagos
                    FROM pagos_mensuales
                    WHERE id_admin = $1 AND estado = $2
                `, [id, 'false']);
    
                const total = (result1.rows[0].total_caja ?? 0) + (result2.rows[0].total_pagos ?? 0);
                if(total > 0){
                    await pool.query(`
                        INSERT INTO historial_cierres (fecha, user_admin, monto, nombre_usuario)
                        VALUES (CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires', $1, $2, $3)
                        `, [id, total, nameUser.trim()]);

        
                    await pool.query(`
                        UPDATE caja
                        SET estado = true
                        WHERE user_admin = $1 AND estado = false
                    `, [id]);
        
                    await pool.query(`
                        UPDATE pagos_mensuales
                        SET estado = true
                        WHERE id_admin = $1 AND estado = false
                    `, [id]);
                }
                return res.status(200).json({ total });
            }
    
            if (action === 'history') {
                const result = await pool.query(`
                    SELECT fecha, monto, nombre_usuario
                    FROM public.historial_cierres
                    WHERE user_admin = $1;
                `, [id]);
    
                return res.status(200).json(result.rows);
            }
    
            const { rows } = await pool.query(`
                SELECT * FROM caja WHERE user_admin = $1 ORDER BY fecha DESC, id DESC
            `, [id]);
    
            return res.status(200).json(rows);
    
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo obtener los clientes del dia', details: error.message });
        }
    }
    

    //POST
    if (req.method === 'POST') {
        //leer el id desde el body
        const { id } = req.query;
        const payload = req.body;

        if (!id) {
            return res.status(500).json({ error: 'Error falta id para insertar usuario', details: 'No se recibió el ID en el cuerpo de la petición' });

        } try {
            const { rows } = await pool.query(
                "INSERT INTO public.caja" +
                " (fecha, detalle, efectivo, debito, credito, transferencia, cheque, observacion, gasto, user_admin)" +
                " VALUES (CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $1)", [id, payload.detalle, payload.efectivo, payload.debito, payload.credito, payload.transferencia, payload.cheque, payload.observacion, payload.gasto]
            );
            return res.status(200).json(rows);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
        }
    }

    //PUT
    if (req.method === 'PUT') {
        const idClient = req.query.id;
        const { idAdmin } = req.body; //el {} quiere decir del objeto req.body, extraeme la propiedad llamada idAdmin
        const payload = req.body; //sin {} porque es un objeto, los objetos se toman completos

        console.log("El payload del update es: ", payload);

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
