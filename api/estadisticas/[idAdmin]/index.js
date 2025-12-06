// api/estadisticas/[idAdmin]/index.js
const { Pool } = require('pg');
const { requireAuth } = require('../protected/requireAuth');

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
  Object.entries(HEADERS).forEach(([key, value]) =>
    res.setHeader(key, value)
  );
  res.setHeader('Access-Control-Allow-Origin', origin);

  // Autenticación
  try {
    req.user = requireAuth(req);
  } catch (e) {
    return res.status(401).json({ error: 'No autorizado', details: e.message });
  }

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
//antes era id 
    const { idAdmin } = req.query;

    if (!idAdmin) {
      return res.status(400).json({ error: 'Falta idAdmin en la ruta' });
    }

    const previous   = await getStatsPreviousMonth(idAdmin);
    const current    = await getStatsCurrenMonth(idAdmin);
    const clients    = await getClients(idAdmin);
    const newClients = await getNewClients(idAdmin);
    const users      = await getUsersByAdmin(idAdmin);
    const yesterday  = await getCollectionYesterday(idAdmin);

    return res
      .status(200)
      .json({ previous, current, clients, newClients, users, yesterday });
  } catch (error) {
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
};

async function getStatsPreviousMonth(idAdmin) {
  const result = await pool.query(
    `
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
    ), 0) AS total
    `,
    [idAdmin]
  );
  return result.rows[0].total;
}

async function getStatsCurrenMonth(idAdmin) {
  const result = await pool.query(
    `
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
    ), 0) AS total
    `,
    [idAdmin]
  );

  return result.rows[0].total;
}

async function getClients(idAdmin) {
  const result = await pool.query(
    `SELECT COUNT(*) AS total FROM public.clientes_mensuales WHERE user_admin = $1`,
    [idAdmin]
  );
  return result.rows[0].total;
}

async function getNewClients(idAdmin) {
  const result = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM public.clientes_mensuales cm
    JOIN public.pagos_mensuales pm ON cm.id_client = pm.id_client
    WHERE cm.user_admin = $1
      AND pm.fecha_pago >= date_trunc('month', CURRENT_DATE)
      AND pm.fecha_pago < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
    `,
    [idAdmin]
  );

  return result.rows[0].total;
}

async function getUsersByAdmin(idAdmin) {
  const result = await pool.query(
    `SELECT COUNT(*) AS total FROM public.users WHERE user_padre_id = $1`,
    [idAdmin]
  );

  return result.rows[0].total;
}

async function getCollectionYesterday(idAdmin) {
  const result = await pool.query(
    `
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
    ), 0) AS total
    `,
    [idAdmin]
  );

  return result.rows[0].total;
}
