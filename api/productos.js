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

    //POST para agregar un producto.
    if (req.method === 'POST') {
        try{

            console.log('Datos recibidos en req.body:', req.body); // Depuración
            const { id, precio_costo, descripcion, imagen, stock, categoria, user_id, ganancia, precio_venta } = req.body

            // Verifico si el producto ya existe
            const result = await pool.query('SELECT * FROM productos WHERE id = $1 and user_id = $2', [id, user_id]);
            if (result.rows.length > 0) {
                return res.status(400).json({ message: 'El producto ya existe'});
            }

            // Si no encuentra un user_id lo setea NULL
            const id_padre = user_id === -1 ? null : user_id;

            const nuevoProducto = await pool.query(
                'INSERT INTO productos (id, precio_costo, descripcion, imagen, stock, categoria, user_id, ganancia, precio_venta) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [id, precio_costo, descripcion, imagen, stock, categoria, user_id, ganancia, precio_venta]
            );

            return res.status(201).json({ message: 'Producto agregado a la base de datos', producto: nuevoProducto.rows[0] });

        }catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Error al crear el producto' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
    
}