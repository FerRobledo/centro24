import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private origin = window.location.origin;

  constructor(private http: HttpClient) {}

  public getProductos(): Observable<any>{
    return this.http.get(this.origin + '/api/productos');
  }

  public actualizarStock(id: number, stock: number): Observable<any> {
    return this.http.put(this.origin + '/api/productos', { id, stock });
  }

  public addProducto(id: string, precio_costo: number, descripcion: string, imagen: string, stock: number, categoria: string, user_id: number, ganancia: number, precio_venta: number): Observable<any> {
    const nuevoProducto = {id, precio_costo, descripcion, imagen, stock, categoria, user_id, ganancia, precio_venta }
    return this.http.post(this.origin + '/api/productos', nuevoProducto);
  }
}