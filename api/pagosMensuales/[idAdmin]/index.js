const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*';

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET
    if (req.method === 'GET') {
        const { idAdmin } = req.query;

        if (!idAdmin) {
            return res.status(400).json({ error: "Debe enviar id (id_admin)" });
        }

        try {
            const query = `
                SELECT 
                    pm.*,
                    cm.cliente as cliente_nombre
                FROM pagos_mensuales pm
                LEFT JOIN clientes_mensuales cm ON pm.id_client = cm.id_client
                WHERE pm.estado = true AND pm.id_admin = $1
                ORDER BY pm.fecha_pago DESC;
        `;

            const { rows } = await pool.query(query, [idAdmin]);

            return res.status(200).json(rows);

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: 'Error al obtener datos',
                details: error.message
            });
        }
    }
    // POST
    if (req.method === 'POST') {
    }

    if (req.method === 'PUT') {
    }
}

