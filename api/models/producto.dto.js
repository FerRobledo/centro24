class ProductoDTO {
    constructor({ id, precio_costo, descripcion, imagen, stock, categoria, id_admin, ganancia, precio_venta, cantidadModificar }) {
        this.id = id || '';
        this.precio_costo = precio_costo || 0;
        this.descripcion = descripcion || null;
        this.imagen = imagen || null;
        this.stock = stock || 0;
        this.categoria = categoria || '';
        this.id_admin = id_admin || 0; // Valor por defecto 0 si no se proporciona
        this.ganancia = ganancia ?? null;
        this.precio_venta = precio_venta || 0;
        this.cantidadModificar = cantidadModificar || null;
    }

    // Método para validar campos obligatorios
    validateRequired() {
        if (!this.id) throw new Error('ID es requerido');
        if (this.precio_costo === undefined || this.precio_costo < 0) throw new Error('Precio de costo es requerido y no puede ser negativo');
        if (this.stock === undefined || this.stock < 0) throw new Error('Stock es requerido y no puede ser negativo');
        if (!this.categoria) throw new Error('Categoría es requerida');
        if (this.id_admin === undefined || this.id_admin < 0) throw new Error('ID de administrador es requerido y no puede ser negativo');
        if (this.ganancia !== undefined && this.ganancia !== null && this.ganancia < 0) throw new Error('Ganancia no puede ser negativa');
        return null;
    }

    // Método para obtener solo los campos a actualizar
    getUpdates() {
        const updates = {};
        if (this.id) updates.id = this.id;
        if (this.precio_costo !== undefined && this.precio_costo !== null) updates.precio_costo = this.precio_costo;
        if (this.descripcion !== null) updates.descripcion = this.descripcion; // Solo si se proporciona
        if (this.imagen !== null) updates.imagen = this.imagen; // Solo si se proporciona
        if (this.stock !== undefined && this.stock !== null) updates.stock = this.stock;
        if (this.categoria) updates.categoria = this.categoria;
        if (this.id_admin !== undefined && this.id_admin !== null) updates.id_admin = this.id_admin;
        if (this.ganancia !== undefined && this.ganancia !== null) updates.ganancia = this.ganancia; // Incluye explícitamente 0
        if (this.precio_venta !== undefined && this.precio_venta !== null) updates.precio_venta = this.precio_venta;
        return updates;
    }
}

module.exports = ProductoDTO;