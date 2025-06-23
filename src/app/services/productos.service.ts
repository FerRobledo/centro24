import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Usuario } from 'src/assets/dto/usuario';
import { ProductoDTO } from 'src/assets/dto/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private origin = window.location.origin;

  constructor(private http: HttpClient, private authService: AuthService) { }

  public getProductos(id: number): Observable<any> {
    return this.http.get(this.origin + '/api/productos/' + id);
  }

  public actualizarStock(id: number, stock: number): Observable<any> {
    return this.http.put(this.origin + '/api/productos', { id, stock });
  }

  public addProducto(producto: ProductoDTO): Observable<any> {
    const id_admin = this.authService.getIdAdmin();
    const nuevoProducto = new ProductoDTO({ ...producto, id_admin });
    return this.http.post(this.origin + '/api/productos/' + id_admin, nuevoProducto);
  }

  public addAllProductos(productos: Producto[]) {
    // Obtengo el id_admin desde auhtService
    const id_admin = this.authService.getIdAdmin();

    const nuevosProductos = productos.map(producto => ({
      ...producto,
      id_admin
    }));

    nuevosProductos.forEach(producto => {
      this.actualizarProducto(producto);
    });
  }

  public actualizarProducto(producto: Producto): Observable<any> {
    return this.http.put(this.origin + '/api/productos', producto);
  }
}