export interface Producto {
  id: string;
  precio_costo: number;
  descripcion?: string | null;  // Puede ser nulo
  imagen?: string | null;     // Opcional, puede ser null
  stock: number;
  categoria: string;
  id_admin: number; 
  ganancia?: number | null; // Puede ser nulo
  precio_venta?: number; // Opcional, se calcula si es necesario
  cantidadModificar?: number | null;    // Se usa para actualizar el stock
}

export class ProductoDTO {
  id: string;
  precio_costo: number;
  descripcion?: string | null;
  imagen?: string | null;
  stock: number;
  categoria: string;
  id_admin: number;
  ganancia?: number | null;
  precio_venta?: number;
  cantidadModificar?: number | null;

  constructor(producto: Partial<Producto> = {}) {
    this.id = producto.id || '';
    this.precio_costo = producto.precio_costo || 0;
    this.descripcion = producto.descripcion || null;
    this.imagen = producto.imagen || null;
    this.stock = producto.stock || 0;
    this.categoria = producto.categoria || '';
    this.id_admin = producto.id_admin || 0; // Valor por defecto 0 si no se proporciona
    this.ganancia = producto.ganancia || null;
    this.precio_venta = producto.precio_venta || 0;
    this.cantidadModificar = producto.cantidadModificar || null;
  }

  // Método para validar campos obligatorios
  validateRequired(): string | null {
    if (!this.id) return 'ID es requerido';
    if (!this.precio_costo && this.precio_costo !== 0) return 'Precio de costo es requerido';
    if (!this.stock && this.stock !== 0) return 'Stock es requerido';
    if (!this.categoria) return 'Categoría es requerida';
    if (!this.id_admin && this.id_admin !== 0) return 'ID de administrador es requerido';
    if (this.ganancia !== undefined && this.ganancia !== null && this.ganancia < 0) return 'Ganancia no puede ser negativa';
    return null;
  }

  // Método para obtener solo los campos a actualizar
  getUpdates(): Partial<Producto> {
    const updates: Partial<Producto> = {};
    if (this.id !== '') updates.id = this.id;
    if (this.precio_costo !== 0) updates.precio_costo = this.precio_costo;
    if (this.descripcion !== null) updates.descripcion = this.descripcion; // Solo si se proporciona
    if (this.imagen !== null) updates.imagen = this.imagen; // Solo si se proporciona
    if (this.stock !== 0) updates.stock = this.stock;
    if (this.categoria !== '') updates.categoria = this.categoria;
    if (this.id_admin !== 0) updates.id_admin = this.id_admin;
    if (this.ganancia !== null) updates.ganancia = this.ganancia; // Solo si se proporciona
    if (this.precio_venta !== 0) updates.precio_venta = this.precio_venta;
    return updates;
  }
}