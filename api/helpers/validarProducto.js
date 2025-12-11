// Esta funcion valida que los datos ingresados de un producto sean consistentes
function validarProducto(producto) {
    const { id, precio_costo, stock, categoria, id_admin, ganancia } = producto;

    if (!id) {
        throw new Error('ID es requerido');
    }
    
    if (precio_costo === undefined || precio_costo === null || precio_costo < 0) {
        throw new Error('Precio de costo es requerido y no puede ser negativo');
    }
    
    if (stock === undefined || stock === null || stock < 0) {
        throw new Error('Stock es requerido y no puede ser negativo');
    }
    
    if (!categoria) {
        throw new Error('Categoría es requerida');
    }
    
    if (id_admin === undefined || id_admin === null || id_admin < 0) {
        throw new Error('ID de administrador es requerido y no puede ser negativo');
    }
    
    if (ganancia !== undefined && ganancia !== null && ganancia < 0) {
        throw new Error('Ganancia no puede ser negativa');
    }

    return true;
}

module.exports = validarProducto;