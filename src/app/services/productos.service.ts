import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, from, map, mergeMap, Observable, of, toArray } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Producto, ProductoDTO } from 'src/assets/dto/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private origin = window.location.origin;

  constructor(private http: HttpClient, private authService: AuthService) { }

  public getProductos(id: number): Observable<any> {
    return this.http.get(this.origin + '/api/productos/' + id);
  }

  public actualizarProducto(producto: ProductoDTO): Observable<Producto> {
    const idAdmin = this.authService.getIdAdmin();
    const updates = producto.getUpdates();
    const body = { ...updates, idAdmin };
    return this.http.put<Producto>(this.origin + '/api/productos/' + producto.id, body);
  }

  public actualizarStock(id: number, stock: number): Observable<any> {
    return this.http.put(this.origin + '/api/productos', { id, stock });
  }

  public addProducto(producto: Producto): Observable<any> {
    const id_admin = this.authService.getIdAdmin();
    const nuevoProducto = new ProductoDTO({ ...producto, id_admin });
    return this.http.post(this.origin + '/api/productos/' + id_admin, nuevoProducto);
  }

  public eliminarProducto(producto: ProductoDTO): Observable<any> {
    const id_admin = this.authService.getIdAdmin();
    const id_producto = producto.id;
    const url = `${this.origin}/api/productos/${id_admin}`;
    return this.http.delete<any>(url, { params: { id_producto: id_producto.toString() } });
  }

  public addAllProductos(productos: ProductoDTO[]): Observable<void> {
    const id_admin = this.authService.getIdAdmin();
    const nuevosProductos = productos.map(producto => ({
      ...producto,
      id_admin
    }));
    return this.http.post<any>(`${this.origin}/api/productos/${id_admin}`, {accion: 'addAll', productos: nuevosProductos})
  }
}