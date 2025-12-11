export interface Producto {
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
}