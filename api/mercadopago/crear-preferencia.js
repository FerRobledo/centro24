const { Pool } = require('pg');
const { crearPreferencia } = require('../mercadoPagoService');


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
    const { userId } = req.body;

    try {
        const { rows } = await pool.query('SELECT * FROM mercado_pago');
        const datosMp = rows[0];
        if (!datosMp) {
            return res.status(404).json({ error: 'Datos no encontrados' });
        }
        // Llamamos al servicio para crear la preferencia
        const { initPoint } = await crearPreferencia(datosMp, userId);
        res.json({ initPoint });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creando preferencia' });
    }
};