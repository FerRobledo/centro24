const { Pool, types } = require('pg');

types.setTypeParser(types.builtins.TIMESTAMP, val => val);
types.setTypeParser(types.builtins.TIMESTAMPTZ, val => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,                        // Máximo 2 conexiones por instancia serverless
  min: 0,                         // Permitir 0 conexiones cuando no hay uso
  idleTimeoutMillis: 10000,      // Cerrar conexiones inactivas después de 10s
  connectionTimeoutMillis: 10000, // 10s para establecer conexión
  allowExitOnIdle: true          // Permite cerrar el pool cuando no hay conexiones activas
});

pool.on('error', (err, client) => {
  console.error('❌ Error en pool de PostgreSQL:', err.message);
  // No lanzar error para evitar crash del servidor
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

module.exports = { pool };