const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Definir en Vercel
    ssl: { rejectUnauthorized: false }, // Necesario si usas PostgreSQL en la nube
});

const ProductoDTO = require('../../models/producto.dto'); // Inyecto el dto de la api

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

    // GET
    if (req.method === 'GET') {

    }

    // PUT para actualizar cualquier campo del producto
    if (req.method === 'PUT') {

    }

    // POST para agregar un producto
    if (req.method === 'POST') {
        try {
            console.log('Datos recibidos en req.body:', req.body); // Depuración
            const productoDTO = new ProductoDTO(req.body);
            const error = productoDTO.validateRequired();
            if (error) {
                return res.status(400).json({ error });
            }

            // Verificar si el producto ya existe
            const { id, id_admin } = productoDTO;
            const result = await pool.query('SELECT * FROM productos WHERE id = $1 AND id_admin = $2', [id, id_admin]);
            if (result.rows.length > 0) {
                return res.status(400).json({ message: 'El producto ya existe' });
            }

            // Insertar el nuevo producto
            const { precio_costo, descripcion, imagen, stock, categoria, ganancia, precio_venta } = productoDTO;
            const query = `
                INSERT INTO productos (id, precio_costo, descripcion, imagen, stock, categoria, id_admin, ganancia, precio_venta)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const values = [id, precio_costo, descripcion, imagen, stock, categoria, id_admin, ganancia, precio_venta];
            const { rows } = await pool.query(query, values);

            return res.status(201).json({ message: 'Producto agregado a la base de datos', producto: rows[0] });
        } catch (error) {
            console.error('Error al crear el producto:', error);
            return res.status(500).json({ message: 'Error al crear el producto', details: error.message });
        }
    }


    if (req.method === 'DELETE') {
        
    }

    // Si ningún método coincide
    return res.status(405).json({ message: 'Método no permitido' });
}