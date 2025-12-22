// Elimina productos duplicados basándose en id e id_admin

export function filtrarProductosUnicos(productos) {
    const vistos = new Set();
    return productos.filter(producto => {
        const clave = `${producto.id}-${producto.id_admin}`;
        if (vistos.has(clave)) return false;
        vistos.add(clave);
        return true;
    });
}
