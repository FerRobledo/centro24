const { Pool } = require('pg');
const { requireAuth } = require('../protected/requireAuth');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Definir en Vercel
  ssl: { rejectUnauthorized: false }, // Necesario si usas PostgreSQL en la nube
});

module.exports = async (req, res) => {
  const origin = req.headers.origin || '*'; // Usa * si no hay origen

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejo de preflight (CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Autenticación
  try {
    req.user = requireAuth(req);
  } catch (e) {
    return res.status(401).json({ error: 'No autorizado', details: e.message });
  }

  // POST para agregar un log a la base
  if (req.method === 'POST') {
    try {
      const { id } = req.query; // id_admin
      const { id_producto, id_user, accion } = req.body;

      // Validaciones
      if (!id_producto || !id_user || !accion) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: id_producto, id_user, accion'
        });
      }

      // Crear fecha en horario argentino usando JavaScript
      const fechaArgentina = new Date().toLocaleString('sv-SE', {
        timeZone: 'America/Argentina/Buenos_Aires'
      });

      const query = `
        INSERT INTO logs (id_producto, id_user, accion, date, user_admin)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [id_producto, id_user, accion, fechaArgentina, id];
      const result = await pool.query(query, values);

      return res.status(201).json({
        message: 'Log creado exitosamente',
        log: result.rows[0]
      });
    } catch (error) {
      console.error('Error al crear log:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  // GET
  if (req.method === 'GET') {

    const { id } = req.query; // id_admin

    // Validacion
    if (!id) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: id_admin'
      });
    }
    // Se calculo la hora a mano para Argentina porque no andaba
    const query = `
        SELECT u.nombre, l.id_user, l.accion, l.id_producto, 
            TO_CHAR(l.date, 'DD/MM/YYYY HH24:MI') AS fecha_y_hora
        FROM logs l 
        JOIN users u ON l.id_user = u.id
        WHERE l.user_admin = $1
        ORDER BY l.date DESC
      `;
    try {
      const result = await pool.query(query, [id]);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al obtener los logs: ', error);
      return res.status(500).json({ error: 'Error al obtener los logs', details: error.message });
    }

  }



  // Si ningún método coincide
  return res.status(405).json({ message: 'Método no permitido' });

}