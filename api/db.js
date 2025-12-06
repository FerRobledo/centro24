const { Pool, types } = require('pg');
// Esto hace que TIMESTAMP y TIMESTAMPTZ se devuelvan como string
types.setTypeParser(types.builtins.TIMESTAMP, val => val);
types.setTypeParser(types.builtins.TIMESTAMPTZ, val => val);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

export default pool;
