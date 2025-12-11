// Construye dinámicamente los campos a actualizar, recalculando precio_venta si es necesario

function construirUpdates(body, currentProducto) {
    const updates = {};
    const fields = ['precio_costo', 'descripcion', 'imagen', 'stock', 'categoria', 'ganancia', 'precio_venta'];

    fields.forEach(field => {
        if (body[field] !== undefined && body[field] !== null) {
            updates[field] = body[field];
        }
    });

    // Recalcular precio_venta si cambió ganancia o precio_costo
    if (updates.ganancia !== undefined) {
        if (updates.ganancia < 0) {
            throw new Error('La ganancia no puede ser negativa');
        }
        const precioBase = updates.precio_costo !== undefined ? updates.precio_costo : currentProducto.precio_costo;
        updates.precio_venta = precioBase * (1 + updates.ganancia / 100);
    } else if (updates.precio_costo !== undefined) {
        updates.precio_venta = updates.precio_costo * (1 + (currentProducto.ganancia || 0) / 100);
    }

    return updates;
}

module.exports = construirUpdates;