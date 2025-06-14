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

  public addProducto(id: string, precio: number, descripcion: string, imagen: string, stock: number, categoria: string, user_id: number): Observable<any> {
    const nuevoProducto = {id, precio, descripcion, imagen, stock, categoria, user_id }
    return this.http.post(this.origin + '/api/productos', nuevoProducto);
  }
}