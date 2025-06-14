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

    //GET
    if(req.method === 'GET'){
        try {
            const { rows } = await pool.query(`SELECT * FROM productos`);

            return res.status(200).json(rows);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al obtener los productos', details: error.message });
        }
    }

    // PUT para actualizar el stock
    if (req.method === 'PUT') {
        try {
            const { id, stock } = req.body; // Espera id y nuevo valor de stock en el cuerpo de la petición
            if (!id || stock === undefined) {
                return res.status(400).json({ error: 'ID y stock son requeridos' });
            }
            const query = 'UPDATE productos SET stock = $1 WHERE id = $2 RETURNING *';
            const { rows } = await pool.query(query, [stock, id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            return res.status(200).json(rows[0]);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar el stock', details: error.message });
        }
    }



    // POST para crear un nuevo producto
    


}