// Construye dinámicamente los valores y placeholders para un INSERT masivo de productos

function construirInsert(productos) {
    const valores = [];
    const placeholders = [];

    productos.forEach((p, index) => {
        const precio_costo = p.precio_costo || 0;
        const ganancia = p.ganancia ?? null;
        const precio_venta = p.precio_venta || (precio_costo * (1 + (ganancia || 0) / 100));

        const baseIndex = index * 9;
        valores.push(
            p.id || '',
            precio_costo,
            p.descripcion || null,
            p.imagen || null,
            p.stock || 0,
            p.categoria || '',
            p.id_admin || 0,
            ganancia,
            precio_venta
        );

        placeholders.push(
            `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`
        );
    });

    return { valores, placeholders };
}

module.exports = construirInsert;