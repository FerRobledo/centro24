import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Usuario } from 'src/assets/dto/usuario';
import { Producto, ProductoDTO } from 'src/assets/dto/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private origin = window.location.origin;

  constructor(private http: HttpClient, private authService: AuthService) {}

  public getProductos(): Observable<any[]> {
    const id_admin = this.authService.getIdAdmin();
    return this.http.get<any[]>(this.origin + '/api/productos/' + id_admin);
  }

  public actualizarProducto(producto: ProductoDTO): Observable<Producto> {
    const updates = producto.getUpdates();
    return this.http.put<Producto>(this.origin + '/api/productos/' + producto.id, updates);
  }

  public addProducto(producto: ProductoDTO): Observable<any> {
    const id_admin = this.authService.getIdAdmin();
    const nuevoProducto = new ProductoDTO({ ...producto, id_admin });
    return this.http.post(this.origin + '/api/productos/' + id_admin, nuevoProducto);
  }
}