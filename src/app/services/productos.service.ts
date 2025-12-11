import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Producto } from 'src/assets/dto/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private origin = window.location.origin;

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Obtener TODOS los productos del admin actual
   * GET /api/productos/[idAdmin]
   */
  public getProductos(idAdmin: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.origin}/api/productos/${idAdmin}`);
  }

  /**
   * Obtener UN producto específico
   * GET /api/productos/[idAdmin]/[idProducto]
   */
  public getProducto(idAdmin: number, idProducto: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.origin}/api/productos/${idAdmin}/${idProducto}`);
  }

  /**
   * Crear UN único producto
   * POST /api/productos/[idAdmin]
   */
  public crearProducto(producto: Producto): Observable<Producto> {
    const idAdmin = this.authService.getIdAdmin();
    return this.http.post<Producto>(
      `${this.origin}/api/productos/${idAdmin}`,
      { ...producto, id_admin: idAdmin }
    );
  }

  /**
   * Actualizar UN producto
   * PUT /api/productos/[idAdmin]/[idProducto]
   */
  public actualizarProducto(producto: Producto): Observable<Producto> {
    const idAdmin = this.authService.getIdAdmin();
    const { id, precio_costo, descripcion, imagen, stock, categoria, ganancia, precio_venta } = producto;

    const body = {
      ...(precio_costo !== undefined && { precio_costo }),
      ...(descripcion !== undefined && { descripcion }),
      ...(imagen !== undefined && { imagen }),
      ...(stock !== undefined && { stock }),
      ...(categoria !== undefined && { categoria }),
      ...(ganancia !== undefined && { ganancia }),
      ...(precio_venta !== undefined && { precio_venta })
    };

    return this.http.put<Producto>(
      `${this.origin}/api/productos/${idAdmin}/${id}`,
      body
    );
  }

  /**
   * Eliminar UN producto
   * DELETE /api/productos/[idAdmin]/[idProducto]
   */
  public eliminarProducto(idProducto: string): Observable<{ message: string }> {
    const idAdmin = this.authService.getIdAdmin();
    return this.http.delete<{ message: string }>(
      `${this.origin}/api/productos/${idAdmin}/${idProducto}`
    );
  }

  /**
   * Crear MÚLTIPLES productos desde Excel (carga masiva)
   * POST /api/productos/[idAdmin]/agregarTodo
   */
  public crearMultiplesProductos(productos: Producto[]): Observable<any> {
    const idAdmin = this.authService.getIdAdmin();
    const productosConAdmin = productos.map(p => ({ ...p, id_admin: idAdmin }));

    return this.http.post<any>(
      `${this.origin}/api/productos/${idAdmin}/agregarTodo`,
      { productos: productosConAdmin }
    );
  }
}