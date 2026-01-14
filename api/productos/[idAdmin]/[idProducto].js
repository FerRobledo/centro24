import pool from '../../db.js';
import { requireAuth } from '../../protected/requireAuth.js';
import { construirUpdates } from '../../helpers/construirUpdates.js';

export default async function handler(req, res) {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

    const { idAdmin, idProducto } = req.query;

    if (req.method === 'GET') {
        return handleGet(idProducto, idAdmin, res);
    }

    if (req.method === 'PUT') {
        return handlePut(idProducto, idAdmin, req.body, res);
    }

    if (req.method === 'DELETE') {
        return handleDelete(idProducto, idAdmin, res);
    }

    return res.status(405).json({ message: 'Método no permitido' });
};

// GET - Obtener UN producto específico
async function handleGet(idProducto, idAdmin, res) {
    if (!idProducto || !idAdmin) {
        return res.status(400).json({ error: 'ID de producto y admin son requeridos' });
    }

    try {
        const { rows } = await pool.query(
            'SELECT * FROM productos WHERE id = $1 AND id_admin = $2 AND activo = true;',
            [idProducto, idAdmin]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener producto:', error.message);
        return res.status(500).json({ error: 'Error al obtener producto' });
    }
}

// PUT - Actualizar UN producto
async function handlePut(idProducto, idAdmin, body, res) {
    if (!idProducto || !idAdmin) {
        return res.status(400).json({ error: 'ID de producto y admin son requeridos' });
    }

    try {
        const { rows: currentRows } = await pool.query(
            'SELECT precio_costo, ganancia FROM productos WHERE id = $1 AND id_admin = $2',
            [idProducto, idAdmin]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const currentProducto = currentRows[0];
        const updates = construirUpdates(body, currentProducto);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
        }

        const updateParams = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
        const values = [...Object.values(updates), idProducto, idAdmin];

        const query = `
            UPDATE productos 
            SET ${updateParams.join(', ')} 
            WHERE id = $${values.length - 1} AND id_admin = $${values.length}
            RETURNING *
        `;

        const { rows } = await pool.query(query, values);
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

// DELETE - Eliminar UN producto
async function handleDelete(idProducto, idAdmin, res) {
    if (!idProducto || !idAdmin) {
        return res.status(400).json({ error: 'ID de producto y admin son requeridos' });
    }

    try {
        const { rowCount } = await pool.query(
            `UPDATE productos SET activo = false 
                WHERE id = $1 AND id_admin = $2`,
            [idProducto, idAdmin]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        return res.status(500).json({ error: 'Error al eliminar producto' });
    }
}