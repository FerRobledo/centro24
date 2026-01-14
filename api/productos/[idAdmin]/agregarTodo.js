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
        return handlePost(req.body, res, req.user.idAdmin);
    }

    return res.status(405).json({ message: 'Método no permitido' });
};

// POST - Importar MÚLTIPLES productos desde Excel
async function handlePost(body, res, idAdmin) {
    const productos = body.productos;

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de productos' });
    }
    const client = await pool.connect();
    const CHUNK_SIZE = 500;
    let procesados = 0;
    let insertados = 0;
    let precioTotalOriginal = 0;
    let precioTotalNuevo = 0;
    try {
        // ABRO CONEXION, al ser una consulta masiva y compleja puede fallar, si falla volvemos atras todos los cambios realizados
        // Validar cada producto
        productos.forEach(validarProducto);

        await client.query('BEGIN');
        console.log(idAdmin);
        let precioTotal = await client.query(`
            SELECT COALESCE(SUM(precio_venta), 0) AS total_antes
            FROM productos
            WHERE id_admin = $1`, [idAdmin])

        precioTotalOriginal = precioTotal.rows[0].total_antes
        // Filtrar duplicados
        const {
            productosUnicos,
            duplicados,
            invalidos,
            total
        } = filtrarProductosUnicos(productos);
        // Construir insert masivo
        for (let i = 0; i < productosUnicos.length; i += CHUNK_SIZE) {
            const chunk = productosUnicos.slice(i, i + CHUNK_SIZE);

            const { valores, placeholders } = construirInsert(chunk);

            const query = `
                INSERT INTO productos
                    (id, precio_costo, descripcion, imagen, stock, categoria, id_admin, ganancia, precio_venta, activo)
                VALUES ${placeholders.join(', ')}
                ON CONFLICT (id, id_admin)
                DO UPDATE SET
                    precio_costo = EXCLUDED.precio_costo,
                    descripcion = EXCLUDED.descripcion,
                    imagen = EXCLUDED.imagen,
                    stock = EXCLUDED.stock,
                    categoria = EXCLUDED.categoria,
                    precio_venta = EXCLUDED.precio_venta,
                    activo = EXCLUDED.activo
                RETURNING
                (xmax = 0) AS insertado;
            `;

            const result = await client.query(query, valores);
            procesados += result.rowCount;

            for (const row of result.rows) {
                if (row.insertado) {
                    insertados++;
                }
            }
        }
        precioTotal = await client.query(`
            SELECT COALESCE(SUM(precio_venta), 0) AS total_despues
            FROM productos
            WHERE id_admin = $1`, [idAdmin])
        precioTotalNuevo = precioTotal.rows[0].total_despues

        const variacion =
            precioTotalOriginal === 0
                ? 0
                : ((precioTotalNuevo - precioTotalOriginal) / precioTotalOriginal) * 100;

        await client.query('COMMIT');
        
        return res.status(201).json({
            message: 'Importación de productos finalizada',
            metricas: {
                total_recibidos: total,
                validos: productosUnicos.length,
                procesados,
                insertados,
                duplicados,
                invalidos,
                variacion
            }
        });
    } catch (error) {
        // EN CASO DE ERROR VOLVER PARA ATRAS TODOS LOS CAMBIOS REALIZADOS
        await client.query('ROLLBACK');
        console.error('Error al importar productos:', error.message);
        return res.status(400).json({ error: error.message });
    }
    finally {
        client.release();
    }
}