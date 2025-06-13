const {Pool} = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false},
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
    if(req.method === 'OPTIONS'){
        return res.status(200).end();
    }

    //GET
    if(req.method === 'GET'){
        //leer el id desde la query
        const {id} = req.query;
        
        if(!id){
            return res.status(500).json({ error: 'Error falta id para obtener los clientes del dia', details: error.message });
        }
        try {
            const{ rows } = await pool.query('SELECT * FROM caja WHERE user_admin = $1', [id]);

            return res.status(200).json(rows);
        } catch(error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo obtener los clientes del dia', details: error.message });

        }
    }

    //POST
    if(req.method === 'POST'){
        //leer el id desde el body
        const {id} = req.body;

        if(!id){
            return res.status(500).json({ error: 'Error falta id para insertar usuario', details: error.message });
            
        } try {
            const { rows } = await pool.query(
                "INSERT INTO public.caja" +
                " (fecha, detalle, efectivo, debito, credito, transferencia, cheque, retiro, observacion, gasto, user_admin)" +
                " VALUES(CURRENT_DATE, '', 0, 0, 0, 0, 0, 0, '', 0, 0, $1)", [id]
              );
              return res.status(200).json(rows);
        }catch(error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo insertar el cliente', details: error.message });
        }
    }
}
