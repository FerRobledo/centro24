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
    const { id } = req.query;

    let previous = await getStatsPreviousMonth(id);
    let current = await getStatsCurrenMonth(id);
    let clients = await getClients(id);
    let newClients = await getNewClients(id);
    let users = await getUsersByAdmin(id);
    let yesterday = await getCollectionYesterday(id);

    return res.status(200).json({ previous, current, clients, newClients, users, yesterday });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

async function getStatsPreviousMonth(id) {
  const result = await pool.query(`
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
      SELECT SUM(efectivo + debito + transferencia + cheque - gasto)
      FROM caja
      WHERE fecha >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
        AND fecha < date_trunc('month', CURRENT_DATE)
        AND user_admin = $1
    ), 0) AS total`, [id]);
  return result.rows[0].total;
};

async function getStatsCurrenMonth(id) {
  const result = await pool.query(`
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
      SELECT SUM(efectivo + debito + transferencia + cheque - gasto)
      FROM caja
      WHERE fecha >= date_trunc('month', CURRENT_DATE)
        AND fecha < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
        AND user_admin = $1
    ), 0) AS total`, [id]);

  return result.rows[0].total;
}

async function getClients(id) {
  const result = await pool.query(`SELECT COUNT(*) AS total FROM public.clientes_mensuales WHERE user_admin = $1`, [id]);
  return result.rows[0].total;
}

async function getNewClients(id) {
  const result = await pool.query(`
  SELECT COUNT(*) AS total
  FROM public.clientes_mensuales cm
  JOIN public.pagos_mensuales pm ON cm.id_client = pm.id_client
  WHERE cm.user_admin = $1
    AND pm.fecha_pago >= date_trunc('month', CURRENT_DATE)
    AND pm.fecha_pago < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')`, [id]);

  return result.rows[0].total;
}

async function getUsersByAdmin(id) {
  const result = await pool.query(`SELECT COUNT(*) AS total FROM public.users WHERE user_padre_id = $1`, [id]);

  return result.rows[0].total;
}

async function getCollectionYesterday(id) {
  const result = await pool.query(`
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
      SELECT SUM(efectivo + debito + transferencia + cheque - gasto)
      FROM caja
      WHERE fecha >= date_trunc('day', CURRENT_DATE - INTERVAL '1 day')
        AND fecha < date_trunc('day', CURRENT_DATE)
        AND user_admin = $1
    ), 0) AS total`, [id]);

  return result.rows[0].total;
}
