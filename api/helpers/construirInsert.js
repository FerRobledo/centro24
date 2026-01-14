// Construye dinámicamente los valores y placeholders para un INSERT masivo de productos

export function construirInsert(productos) {
    const valores = [];
    const placeholders = [];

    productos.forEach((p, index) => {
        const precio_costo = Number.isFinite(p.precio_costo)
            ? p.precio_costo
            : 0;
        const ganancia = Number.isFinite(p.ganancia) ? p.ganancia : 0;
        const precio_venta = Math.round(
            precio_costo * (1 + ganancia / 100)
        ).toFixed(2);

        const baseIndex = index * 10;
        valores.push(
            p.id || '',
            precio_costo,
            p.descripcion || null,
            p.imagen || null,
            p.stock || 0,
            p.categoria || '',
            p.id_admin || 0,
            ganancia,
            precio_venta,
            true
        );

        placeholders.push(
            `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10})`
        );
    });

    return { valores, placeholders };
}
