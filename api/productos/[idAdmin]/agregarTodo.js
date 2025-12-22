/**
 * Importar múltiples productos desde Excel
 * 
 * POST /api/productos/[idAdmin]/agregarTodo  → Crear múltiples productos desde bulk
 */

import pool from '../../db.js';
import { requireAuth } from '../../protected/requireAuth.js';
import { validarProducto } from '../../helpers/validarProducto.js';
import { filtrarProductosUnicos } from '../../helpers/filtrarProductosUnicos.js';
import { construirInsert } from '../../helpers/construirInsert.js';

export default async function handler(req, res) {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

    if (req.method === 'POST') {
        return handlePost(req.body, res);
    }

    return res.status(405).json({ message: 'Método no permitido' });
};

// POST - Importar MÚLTIPLES productos desde Excel
async function handlePost(body, res) {
    const productos = body.productos;

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de productos' });
    }

    try {
        // Validar cada producto
        productos.forEach(validarProducto);

        // Filtrar duplicados
        const productosSinDuplicados = filtrarProductosUnicos(productos);

        // Construir insert masivo
        const { valores, placeholders } = construirInsert(productosSinDuplicados);

        const query = `
            INSERT INTO productos (id, precio_costo, descripcion, imagen, stock, categoria, id_admin, ganancia, precio_venta)
            VALUES ${placeholders.join(', ')}
            ON CONFLICT (id, id_admin)
            DO UPDATE SET
                precio_costo = EXCLUDED.precio_costo,
                descripcion = EXCLUDED.descripcion,
                imagen = EXCLUDED.imagen,
                stock = EXCLUDED.stock,
                categoria = EXCLUDED.categoria,
                precio_venta = EXCLUDED.precio_venta
            RETURNING *;
        `;

        const { rows } = await pool.query(query, valores);

        return res.status(201).json({
            message: `Se procesaron ${rows.length} de ${productosSinDuplicados.length} productos`,
            procesados: rows.length,
            total: productosSinDuplicados.length,
            productos: rows
        });
    } catch (error) {
        console.error('Error al importar productos:', error.message);
        return res.status(400).json({ error: error.message });
    }
}