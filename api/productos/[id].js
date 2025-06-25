const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Definir en Vercel
    ssl: { rejectUnauthorized: false }, // Necesario si usas PostgreSQL en la nube
});

const ProductoDTO = require('../models/producto.dto'); // Inyecto el dto de la api

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
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID de administrador es requerido para obtener los productos' });
        }
        try {
            const { rows } = await pool.query('SELECT * FROM productos WHERE id_admin = $1', [id]);
            return res.status(200).json(rows);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            return res.status(500).json({ error: 'Error al obtener los productos', details: error.message });
        }
    }

    // PUT para actualizar cualquier campo del producto
    if (req.method === 'PUT') {
        try {
            const { id } = req.query; // Extraer id de los parámetros de la URL
            if (!id) {
                return res.status(400).json({ error: 'ID es requerido' });
            }

            // Crear instancia de ProductoDTO con los datos del cuerpo
            let productoDTO;
            try {
                productoDTO = new ProductoDTO(req.body);
                productoDTO.validateRequired();
            } catch (error) {
                return res.status(400).json({ error: 'Datos inválidos', details: error.message });
            }

            // Obtener el producto actual para cálculos o validaciones
            const selectQuery = 'SELECT precio_costo, ganancia, id_admin FROM productos WHERE id = $1';
            const { rows: currentRows } = await pool.query(selectQuery, [id]);
            if (currentRows.length === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            const currentProducto = currentRows[0];

            // Calcular nuevo precio_venta si se proporciona ganancia
            let nuevoPrecioVenta = currentProducto.precio_venta || 0;
            if (productoDTO.ganancia !== undefined && productoDTO.ganancia !== null && productoDTO.ganancia !== currentProducto.ganancia) {
                if (productoDTO.ganancia < 0) {
                    return res.status(400).json({ error: 'La ganancia no puede ser negativa' });
                }
                nuevoPrecioVenta = currentProducto.precio_costo * (1 + productoDTO.ganancia / 100);
                productoDTO.precio_venta = nuevoPrecioVenta;
            }

            // Obtener solo los campos a actualizar
            const updates = productoDTO.getUpdates();
            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
            }

            // Construir la consulta SQL dinámicamente
            const updateParams = [];
            const values = [];
            Object.keys(updates).forEach((key, index) => {
                updateParams.push(`${key} = $${index + 1}`);
                values.push(updates[key]);
            });
            values.push(id); // Agregar id al final para la cláusula WHERE
            const query = `UPDATE productos SET ${updateParams.join(', ')} WHERE id = $${values.length} RETURNING *`;

            // Ejecutar la consulta
            const { rows } = await pool.query(query, values);
            return res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            return res.status(500).json({ error: 'Error al actualizar el producto', details: error.message });
        }
    }

    // POST para agregar un producto
    if (req.method === 'POST') {
        try {
            console.log('Datos recibidos en req.body:', req.body); // Depuración
            const productoDTO = new ProductoDTO(req.body);

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
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
};