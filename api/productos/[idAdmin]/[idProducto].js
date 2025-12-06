
const { pool } = require('../../db');
const { requireAuth } = require('../../protected/requireAuth')

const ProductoDTO = require('../../models/producto.dto'); // Inyecto el dto de la api

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*'; // Usa * si no hay origen

    // Autenticación
    try {
        req.user = requireAuth(req);
    } catch (e) {
        return res.status(401).json({ error: 'No autorizado', details: e.message });
    }

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
        try {
            const { idProducto, idAdmin } = req.query; // ID del producto desde la URL

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

    }


    if (req.method === 'DELETE') {
        try {
            // Extraer id_admin de la ruta y id_producto del query con validación
            const { idProducto, idAdmin } = req.query; // Usa el operador opcional

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

