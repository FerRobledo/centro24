const { Pool } = require('pg');
const { requireAuth } = require('../protected/requireAuth');

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

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
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
            const idProducto = req.query.id; // ID del producto desde la URL
            const { idAdmin } = req.body; // ID del admin desde el body

            if (!idProducto) {
                return res.status(400).json({ error: 'ID del producto es requerido' });
            }

            if (!idAdmin) {
                return res.status(400).json({ error: 'ID del administrador es requerido' });
            }

            // Crear instancia de ProductoDTO con los datos del cuerpo
            let productoDTO;
            try {
                productoDTO = new ProductoDTO(req.body);
                productoDTO.validateRequired();
            } catch (error) {
                return res.status(400).json({ error: 'Datos inválidos', details: error.message });
            }

            // Obtener el producto actual para cálculos o validaciones y verificar que pertenece al admin
            const selectQuery = 'SELECT precio_costo, ganancia, id_admin FROM productos WHERE id = $1 AND id_admin = $2';
            const { rows: currentRows } = await pool.query(selectQuery, [idProducto, idAdmin]);
            if (currentRows.length === 0) {
                return res.status(404).json({ error: 'Producto no encontrado o no pertenece al administrador' });
            }
            const currentProducto = currentRows[0];

            // Calcular nuevo precio_venta si se proporciona ganancia o precio_costo
            let nuevoPrecioVenta = currentProducto.precio_venta || 0;
            if (productoDTO.ganancia !== undefined && productoDTO.ganancia !== null) {
                if (productoDTO.ganancia < 0) {
                    return res.status(400).json({ error: 'La ganancia no puede ser negativa' });
                }
                // Usar el nuevo precio_costo si se proporcionó, sino el actual
                const precioBase = productoDTO.precio_costo !== undefined ? productoDTO.precio_costo : currentProducto.precio_costo;
                nuevoPrecioVenta = precioBase * (1 + productoDTO.ganancia / 100);
                productoDTO.precio_venta = nuevoPrecioVenta;
            } else if (productoDTO.precio_costo !== undefined && productoDTO.precio_costo !== null) {
                // Si solo cambió precio_costo, recalcular con la ganancia actual
                nuevoPrecioVenta = productoDTO.precio_costo * (1 + (currentProducto.ganancia || 0) / 100);
                productoDTO.precio_venta = nuevoPrecioVenta;
            }

            // Obtener solo los campos a actualizar (excluyendo idAdmin)
            const updates = productoDTO.getUpdates();
            delete updates.idAdmin; // Remover idAdmin de los updates

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
            values.push(idProducto); // Agregar id del producto al final para la cláusula WHERE
            values.push(idAdmin); // Agregar id del admin para la cláusula WHERE
            const query = `UPDATE productos SET ${updateParams.join(', ')} WHERE id = $${values.length - 1} AND id_admin = $${values.length} RETURNING *`;

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
        const { accion } = req.body;

        // La accion 'addAll' viene si se quieren agregar varios productos a la vez
        if (accion != "addAll") {
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
        } else {
            // Manejo de carga masiva
            const productos = req.body.productos;
            const productosSinDuplicados = filtrarProductosUnicos(productos);

            if (!Array.isArray(productosSinDuplicados) || productosSinDuplicados.length === 0) {
                return res.status(400).json({ error: 'No se enviaron productos' });
            }

            const valores = [];
            const placeholders = [];

            productosSinDuplicados.forEach((p, index) => {
                const productoDTO = new ProductoDTO(p);
                const baseIndex = index * 9;

                valores.push(
                    productoDTO.id,
                    productoDTO.precio_costo,
                    productoDTO.descripcion,
                    productoDTO.imagen,
                    productoDTO.stock,
                    productoDTO.categoria,
                    productoDTO.id_admin,
                    productoDTO.ganancia,
                    productoDTO.precio_venta
                );

                const grupo = `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`;
                placeholders.push(grupo);
            });

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

            try {
                const { rows } = await pool.query(query, valores);
                return res.status(200).json({ message: `Se insertaron/actualizaron ${rows.length} productos`, productos: rows });
            } catch (error) {
                console.error('Error al hacer UPSERT de productos:', error);
                return res.status(500).json({ error: 'Error al insertar o actualizar productos', details: error.message });
            }
        }
    }


    if (req.method === 'DELETE') {
        try {
            // Extraer id_admin de la ruta y id_producto del query con validación
            const { id } = req.query; // Usa el operador opcional
            const id_producto = req.query?.id_producto;

            console.log('Parámetros recibidos:', { id_producto, id });

            // Validar que los parámetros existan
            if (!id_producto || !id) {
                return res.status(400).json({ message: 'id_producto e id_admin son requeridos' });
            }

            // Verificar si el producto existe y pertenece al admin
            const verificacion = await pool.query(
                'SELECT * FROM productos WHERE id = $1 AND id_admin = $2',
                [id_producto, id]
            );
            console.log('Verificación:', verificacion.rowCount);
            if (verificacion.rowCount === 0) {
                return res.status(400).json({ message: 'No es posible eliminar el producto' });
            }

            // Eliminar el producto
            await pool.query(
                'DELETE FROM productos WHERE id = $1 AND id_admin = $2',
                [id_producto, id]
            );

            return res.status(200).json({ message: 'Producto eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar el producto:', error.stack || error.message || error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // Si ningún método coincide
    return res.status(405).json({ message: 'Método no permitido' });
}

function filtrarProductosUnicos(productos) {
    const vistos = new Set();
    const unicos = [];

    for (const producto of productos) {
        const clave = `${producto.id}-${producto.id_admin}`;
        if (!vistos.has(clave)) {
            vistos.add(clave);
            unicos.push(producto);
        }
    }

    return unicos;
}