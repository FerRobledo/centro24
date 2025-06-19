const {Pool} = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false},
});

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*';

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if(req.method === 'OPTIONS'){
        return res.status(200).end();
    }

    //GET
    if(req.method === 'GET'){
        const {id, action} = req.query;
        
        if(!id){
            return res.status(400).json({ error: 'Error falta id para obtener los clientes del dia', details: error.message });
        }
        try {/*
            if(action === 'close'){
                const result = await pool.query('SELECT SUM '
                                            +'(efectivo + debito + transferencia + cheque + gasto + retiro) AS total'
                                            +' FROM caja WHERE fecha = CURRENT_DATE AND user_admin = $1', [id]);

                const total = result.rows[0].total ?? 0;

                return res.status(200).json({ total });
            }*/
            const{ rows } = await pool.query('SELECT * FROM clientes_mensuales WHERE user_admin = $1', [id]);
            return res.status(200).json(rows);
        } catch(error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo obtener los clientes del dia', details: error.message });
        }
    }

    //POST
    if(req.method === 'POST'){
        const {id} = req.query;
        const payload = req.body;

        if(!id){
            return res.status(500).json({ error: 'Error falta id para insertar usuario', details: 'No se recibió el ID en el cuerpo de la petición' });
                        
        } try {
            const { rows } = await pool.query(
                "INSERT INTO public.clientes_mensuales" +
                " (tipo, cliente, mensual, bonificacion, semanal, user_admin)" +
                " VALUES ($2, $3, $4, $5, $1)", [id, payload.tipo, payload.cliente, payload.mensual, payload.bonificacion, payload.semanal]
              );
              return res.status(200).json(rows);
        }catch(error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
        }
    }
}
