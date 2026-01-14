// Elimina productos duplicados basándose en id e id_admin

export function filtrarProductosUnicos(productos) {
    const vistos = new Set();
    const unicos = [];
    let duplicados = 0;
    let invalidos = 0;

    for (const p of productos) {
        if (!p?.id || p.id_admin == null) {
            invalidos++;
            continue;
        }

        const clave = JSON.stringify([p.id, p.id_admin]);

        if (vistos.has(clave)) {
            duplicados++;
            continue;
        }

        vistos.add(clave);
        unicos.push(p);
    }

    return {
        productosUnicos: unicos,
        duplicados,
        invalidos,
        total: productos.length
    };
}