const { Pool } = require('pg');

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

    // DELETE
    if (req.method === 'DELETE') {
        const {idAdmin, idPago}= req.query;

        if (!idPago) {
            return res.status(400).json({ error: "Faltan datos para eliminar el pago" });
        }
        try {
            await pool.query(`UPDATE pagos_mensuales SET activo = false WHERE id = $1 AND id_admin = $2`, [idPago, idAdmin]);
            return res.status(200).json({ success: true });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error no se pudo eliminar el pago', details: error.message });
        }
    }
};


