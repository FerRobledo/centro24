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

    //GET
    if (req.method === 'GET') {
        //leer el id desde la query
        const { id, action } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Error falta id para obtener los clientes del dia', details: error.message });
        }
        try {
            if (action === 'close') {
                const result = await pool.query('SELECT SUM '
                    + '(efectivo + debito + transferencia + cheque + gasto + retiro) AS total'
                    + ' FROM caja WHERE fecha = CURRENT_DATE AND user_admin = $1', [id]);

                const total = result.rows[0].total ?? 0;

                return res.status(200).json({ total });
            }
            const { rows } = await pool.query('SELECT * FROM caja WHERE user_admin = $1 ORDER BY fecha DESC, id DESC', [id]);
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

        if(!id){
            return res.status(500).json({ error: 'Error falta id para insertar usuario', details: 'No se recibió el ID en el cuerpo de la petición' });

        } try {
            const { rows } = await pool.query(
                "INSERT INTO public.caja" +
                " (fecha, detalle, efectivo, debito, credito, transferencia, cheque, retiro, observacion, gasto, user_admin)" +
                " VALUES (CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $10, $1)", [id, payload.detalle, payload.efectivo, payload.debito, payload.credito, payload.transferencia, payload.cheque, payload.retiro, payload.observacion, payload.gasto]
            );
            return res.status(200).json(rows);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
        }
    }

    //PUT
    if (req.method === 'PUT') {
        const idClient  = req.query.id;
        const { idAdmin } = req.body; //el {} quiere decir del objeto req.body, extraeme la propiedad llamada idAdmin
        const payload = req.body; //sin {} porque es un objeto, los objetos se toman completos
        
        console.log("El payload del update es: ", payload);

        if (!idClient) {
            return res.status(500).json({ error: 'Error falta id para actualizar usuario', details: 'No se recibió el ID en el cuerpo de la petición' });
        } try {
            const { rows } = await pool.query(
                "UPDATE public.caja"+
                " SET detalle=$1, efectivo=$2, debito=$3, credito=$4, transferencia=$5, cheque=$6, retiro=$7, observacion=$8, gasto=$9, user_admin=$10" +
                " WHERE id=$11;", [payload.detalle, payload.efectivo, payload.debito, payload.credito, payload.transferencia, payload.cheque, payload.retiro, payload.observacion, payload.gasto, idAdmin, idClient]
            );
            return res.status(200).json(rows);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo actualizar el cliente', details: error.message });
        }
    }
}
