export interface Log {
  id?: number; // Opcional porque se auto-genera
  id_producto: string;
  id_user: number;
  accion: string;
  date: Date;
  user_admin: number;
  // Campos adicionales que pueden venir del backend con joins
  nombre?: string;
  fecha_y_hora?: string;
  nombre_admin?: string;
  descripcion_producto?: string;
}

export function newLog(): Log {
  return {
    // No incluimos 'id' porque se auto-genera
    id_producto: '',
    id_user: 0,
    accion: '',
    date: new Date(),
    user_admin: 0
  }
}