import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})


export class ProductosComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categoriasUnicas: string[] = [];
  cantidadModificar: number | null = null;

  constructor(private productosService: ProductosService) {
    console.log('Componente AppComponent inicializado');
  }

  
  ngOnInit() {
    console.log('ngOnInit ejecutándose');
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data.map((producto: any) => ({ ...producto, cantidadModificar: null }));
        this.productosFiltrados = [...this.productos];
        this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        console.log('Datos recibidos:', data);
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
      },
      complete: () => {
        console.log('Solicitud completada');
      }
    });
  }

  filtrarCategoria(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      this.productosFiltrados = this.productos.filter(p => p.categoria === value);
    } else {
      this.productosFiltrados = [...this.productos];
    }
  }

  filtrarStrockMayorCero(){
    this.productosFiltrados = this.productos.filter(p => p.stock > 0);
  }

  mostrarTodos(){
    this.productosFiltrados = [...this.productos];
  }


  incrementarStock(producto: any) {
    const nuevoStock = (producto.stock || 0) + 1;
    this.productosService.actualizarStock(producto.id, nuevoStock).subscribe(
      updatedProducto => {
        producto.stock = updatedProducto.stock; // Actualiza el valor local con la respuesta del servidor
      },
      error => console.error('Error al incrementar stock', error)
    );
  }

  decrementarStock(producto: any) {
    if (producto.stock > 0) {
      const nuevoStock = (producto.stock || 0) - 1;
      this.productosService.actualizarStock(producto.id, nuevoStock).subscribe(
        updatedProducto => {
          producto.stock = updatedProducto.stock; // Actualiza el valor local con la respuesta del servidor
        },
        error => console.error('Error al decrementar stock', error)
      );
    }
  }

  onCantidadChange(producto: any) {
    // Validar que la cantidad sea un número válido
    const value = parseInt(producto.cantidadModificar, 10);
    producto.cantidadModificar = isNaN(value) ? null : value;
  }

  modificarStock(producto: any) {
    if (producto.cantidadModificar !== null && producto.cantidadModificar !== 0) {
      const cambio = producto.cantidadModificar;
      const nuevoStock = (producto.stock || 0) + cambio;
      if (nuevoStock >= 0) {
        this.productosService.actualizarStock(producto.id, nuevoStock).subscribe(
          updatedProducto => {
            producto.stock = updatedProducto.stock;
            producto.cantidadModificar = null; // Resetear el input
          },
          error => console.error('Error al modificar stock', error)
        );
      } else {
        alert('No puedes restar más stock del que hay disponible. Stock actual: ' + producto.stock);
        producto.cantidadModificar = null; // Resetear si el valor es inválido
      }
    }
  }
}
