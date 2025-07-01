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

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    //GET
    if (req.method === 'GET') {
        //leer el id desde la query
        const { id, action } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Error falta id para obtener las stats', details: error.message });
        }
        try {
            if (action === 'previous') {
                const result = await pool.query(
                    "SELECT COALESCE((" +
                    "SELECT SUM(pm.monto) " +
                    "FROM public.pagos_mensuales pm " +
                    "JOIN public.clientes_mensuales cm on (pm.id_client = cm.id_client) " +
                    "WHERE pm.fecha_pago >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') " +
                    "AND pm.fecha_pago < date_trunc('month', CURRENT_DATE) " +
                    "AND cm.user_admin = $1),0)" +
                    "+" +
                    "COALESCE((" +
                    "SELECT SUM(efectivo + debito + transferencia + cheque + gasto + retiro)" +
                    "FROM caja" +
                    " WHERE fecha >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') " +
                    " AND fecha < date_trunc('month', CURRENT_DATE) " +
                    " AND user_admin = $1),0) AS total", [id]);
                const total = result.rows[0].total ?? 0;
                //date_trunc('month', CURRENT_DATE)
                // Da el primer día del mes actual a las 00:00 hs.
                //date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
                // Da el primer día del mes siguiente a las 00:00 hs.
                return res.status(200).json(total);
            }
            else if (action === 'current') {
                const result = await pool.query(`
                        SELECT
                        COALESCE((
                            SELECT SUM(pm.monto)
                            FROM public.pagos_mensuales pm
                            JOIN public.clientes_mensuales cm ON pm.id_client = cm.id_client
                            WHERE pm.fecha_pago >= date_trunc('month', CURRENT_DATE)
                            AND pm.fecha_pago < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
                            AND cm.user_admin = $1), 0)
                        +
                        COALESCE((
                            SELECT SUM(efectivo + debito + transferencia + cheque + gasto + retiro)
                            FROM caja
                            WHERE fecha >= date_trunc('month', CURRENT_DATE)
                            AND fecha < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
                            AND user_admin = $1
                        ), 0) AS total;`, [id]);
                const total = result.rows[0].total ?? 0;
                return res.status(200).json(total);
            }
            else if (action === 'clients') {
                const { rows } = await pool.query(`
                        SELECT COUNT(*) FROM public.clientes_mensuales WHERE user_admin=$1;`, [id]);
                const total = parseInt(rows[0].count) || 0; // → result.rows[0] ?? 0; esta mal pq el count esta todavia{ count: '5' }
                return res.status(200).json(total);
            }
            else if (action === 'newClients') {
                const { rows } = await pool.query(`
                        SELECT COUNT(*) AS cant
                            FROM public.clientes_mensuales cm
                            JOIN public.pagos_mensuales pm ON (cm.id_client = pm.id_client)
                            WHERE cm.user_admin=$1
                            AND pm.fecha_pago >= date_trunc('month', CURRENT_DATE) 
                            AND pm.fecha_pago < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')`, [id]);
                const total = parseInt(rows[0].cant) || 0;
                return res.status(200).json(total);
            }
            else if (action === 'users') {
                const { rows } = await pool.query(`
                        SELECT COUNT(*) AS cantUsers
                            FROM public.users 
                            WHERE user_padre_id=$1`, [id]);

                const total = parseInt(rows[0].cantusers) || 0; //cantUsers no anda, pq postgres devuelve en minusculas
                return res.status(200).json(total);
            }
            else if (action === 'yesterday') {
                const { rows } = await pool.query(
                    "SELECT COALESCE((" +
                        "SELECT SUM(pm.monto) " +
                        "FROM public.pagos_mensuales pm " +
                        "JOIN public.clientes_mensuales cm on (pm.id_client = cm.id_client) " +
                        "WHERE pm.fecha_pago >= date_trunc('day', CURRENT_DATE - INTERVAL '1 day') " +
                        "AND pm.fecha_pago < date_trunc('day', CURRENT_DATE) " +
                        "AND cm.user_admin = $1),0)" +
                        "+" +
                    "COALESCE((" +
                        "SELECT SUM(efectivo + debito + transferencia + cheque + gasto + retiro)" +
                        "FROM caja" +
                        " WHERE fecha >= date_trunc('day', CURRENT_DATE - INTERVAL '1 day') " +
                        " AND fecha < date_trunc('day', CURRENT_DATE) " +
                        " AND user_admin = $1),0) AS total", [id]);
                const total = parseInt(rows[0].total) || 0;
                return res.status(200).json(total);
            }
            else {
                console.log("no entre a ninguno");
            }

            return res.status(200).json(rows);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo obtener los clientes del dia', details: error.message });
        }
    }


}
