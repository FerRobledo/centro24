import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private origin = window.location.origin;

  constructor(private http: HttpClient, private authService: AuthService) {}

  public getProductos(id: number): Observable<any>{
    return this.http.get(this.origin + '/api/productos/' + id);
  }

  public actualizarStock(id: number, stock: number): Observable<any> {
    return this.http.put(this.origin + '/api/productos', { id, stock });
  }

  public addProducto(id: string, precio_costo: number, descripcion: string, imagen: string, stock: number, categoria: string, ganancia: number, precio_venta: number): Observable<any> {
    // Obtengo el id_admin desde auhtService
    const id_admin = this.authService.getIdAdmin();

    const nuevoProducto = {id, precio_costo, descripcion, imagen, stock, categoria, id_admin, ganancia, precio_venta }
    return this.http.post(this.origin + '/api/productos', nuevoProducto);
  }
}