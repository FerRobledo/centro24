const { Pool, types } = require('pg');

types.setTypeParser(types.builtins.TIMESTAMP, val => val);
types.setTypeParser(types.builtins.TIMESTAMPTZ, val => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err, client) => {
  console.error('❌ Error en pool:', err.message);
});

module.exports = { pool };