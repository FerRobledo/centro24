const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
};

module.exports = async (req, res) => {
  const origin = req.headers.origin || '*';
  Object.entries(HEADERS).forEach(([key, value]) => res.setHeader(key, value));//map para key -> value de options
  res.setHeader('Access-Control-Allow-Origin', origin);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
    try {
        const { id, action } = req.query;
        let query = '';
        const values = [id];
        let parser = (rows) => parseFloat(rows[0]?.total) || 0; //desglosar el objeto y guardar directo el numero

        switch (action) {
          case 'previous':
            //console.log("entro aca?");
            query = `
              SELECT COALESCE((
                SELECT SUM(pm.monto)
                FROM public.pagos_mensuales pm
                JOIN public.clientes_mensuales cm ON pm.id_client = cm.id_client
                WHERE pm.fecha_pago >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                  AND pm.fecha_pago < date_trunc('month', CURRENT_DATE)
                  AND cm.user_admin = $1
              ), 0)
              +
              COALESCE((
                SELECT SUM(efectivo + debito + transferencia + cheque + gasto + retiro)
                FROM caja
                WHERE fecha >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                  AND fecha < date_trunc('month', CURRENT_DATE)
                  AND user_admin = $1
              ), 0) AS total`;
            break;
    
          case 'current':
            query = `
              SELECT COALESCE((
                SELECT SUM(pm.monto)
                FROM public.pagos_mensuales pm
                JOIN public.clientes_mensuales cm ON pm.id_client = cm.id_client
                WHERE pm.fecha_pago >= date_trunc('month', CURRENT_DATE)
                  AND pm.fecha_pago < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
                  AND cm.user_admin = $1
              ), 0)
              +
              COALESCE((
                SELECT SUM(efectivo + debito + transferencia + cheque + gasto + retiro)
                FROM caja
                WHERE fecha >= date_trunc('month', CURRENT_DATE)
                  AND fecha < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
                  AND user_admin = $1
              ), 0) AS total`;
            break;
    
          case 'clients':
            query = `SELECT COUNT(*) AS total FROM public.clientes_mensuales WHERE user_admin = $1`;
            parser = (rows) => parseInt(rows[0].total, 10) || 0;//converti esto a un número entero usando el decimal (base 10), si es nulll devolve 0
            break;
    
          case 'newClients':
            query = `
              SELECT COUNT(*) AS total
              FROM public.clientes_mensuales cm
              JOIN public.pagos_mensuales pm ON cm.id_client = pm.id_client
              WHERE cm.user_admin = $1
                AND pm.fecha_pago >= date_trunc('month', CURRENT_DATE)
                AND pm.fecha_pago < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')`;
            parser = (rows) => parseInt(rows[0].total, 10) || 0; //redefino pq son enteros y no float
            break;
    
          case 'users':
            query = `SELECT COUNT(*) AS total FROM public.users WHERE user_padre_id = $1`;
            parser = (rows) => parseInt(rows[0].total, 10) || 0;
            break;
    
          case 'yesterday':
            query = `
              SELECT COALESCE((
                SELECT SUM(pm.monto)
                FROM public.pagos_mensuales pm
                JOIN public.clientes_mensuales cm ON pm.id_client = cm.id_client
                WHERE pm.fecha_pago >= date_trunc('day', CURRENT_DATE - INTERVAL '1 day')
                  AND pm.fecha_pago < date_trunc('day', CURRENT_DATE)
                  AND cm.user_admin = $1
              ), 0)
              +
              COALESCE((
                SELECT SUM(efectivo + debito + transferencia + cheque + gasto + retiro)
                FROM caja
                WHERE fecha >= date_trunc('day', CURRENT_DATE - INTERVAL '1 day')
                  AND fecha < date_trunc('day', CURRENT_DATE)
                  AND user_admin = $1
              ), 0) AS total`;
            break;
    
          default:
            return res.status(400).json({ error: 'Acción inválida' });
        }
        const result = await pool.query(query, values);
        const total = parser(result.rows);
        return res.status(200).json(total);
      } catch (error) {
        return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
      }
    };