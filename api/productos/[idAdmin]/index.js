const { pool } = require('../../db');
const { requireAuth } = require('../../protected/requireAuth');
const validarProducto = require('../../helpers/validarProducto');

module.exports = async (req, res) => {
    // CORS
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (error) {
        return res.status(401).json({ error: 'No autorizado', details: error.message });
    }

    const { idAdmin } = req.query;

    if (req.method === 'GET') {
        return handleGet(idAdmin, res);
    }

    if (req.method === 'POST') {
        return handlePost(req.body, idAdmin, res);
    }

    return res.status(405).json({ message: 'Método no permitido' });
};

// GET - Obtener TODOS los productos del admin
async function handleGet(idAdmin, res) {
    if (!idAdmin) {
        return res.status(400).json({ error: 'ID de administrador es requerido' });
    }

    try {
        const { rows } = await pool.query(
            'SELECT * FROM productos WHERE id_admin = $1',
            [idAdmin]
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
        return res.status(500).json({ error: 'Error al obtener productos' });
    }
}

// POST - Crear UN ÚNICO producto
async function handlePost(body, idAdmin, res) {
    if (!idAdmin) {
        return res.status(400).json({ error: 'ID de administrador es requerido' });
    }
    try {
        // Validar producto
        validarProducto(body);

        const { id, precio_costo, descripcion, imagen, stock, categoria, ganancia } = body;

        // Calcular precio_venta
        const precio_venta = precio_costo * (1 + (ganancia || 0) / 100);

        // Verificar si el producto ya existe
        const { rows: existingRows } = await pool.query(
            'SELECT * FROM productos WHERE id = $1 AND id_admin = $2',
            [id, idAdmin]
        );

        if (existingRows.length > 0) {
            return res.status(409).json({ error: 'El producto ya existe' });
        }

        // Insertar el nuevo producto
        const query = `
            INSERT INTO productos (id, precio_costo, descripcion, imagen, stock, categoria, id_admin, ganancia, precio_venta)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [id, precio_costo, descripcion || null, imagen || null, stock, categoria, idAdmin, ganancia || null, precio_venta];
        const { rows } = await pool.query(query, values);

        return res.status(201).json({
            message: 'Producto creado exitosamente',
            producto: rows[0]
        });
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        return res.status(400).json({ error: error.message });
    }
}
