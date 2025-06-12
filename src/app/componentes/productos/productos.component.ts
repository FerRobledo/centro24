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
  categoriaSeleccionada: string = '';   //Filtro principal (categoria)

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
    this.categoriaSeleccionada = value; // Actualiza la categoría seleccionada
    this.aplicarFiltros(); // Aplica todos los filtros
  }

  filtrarStockMayorCero() {
    this.aplicarFiltros(true); // Aplicar filtro de stock > 0
  }

  mostrarTodos() {
    this.aplicarFiltros(false); // Mostrar todos dentro de la categoría seleccionada
  }

  aplicarFiltros(filtrarStock: boolean = false) {
    let resultado = [...this.productos];

    // Filtro principal: categoría seleccionada
    if (this.categoriaSeleccionada) {
      resultado = resultado.filter(p => p.categoria === this.categoriaSeleccionada);
    }

    // Filtro secundario: stock > 0 si se solicita
    if (filtrarStock) {
      resultado = resultado.filter(p => p.stock > 0);
    }

    this.productosFiltrados = resultado;
    console.log('Filtros aplicados. Resultado:', this.productosFiltrados);
  }

  incrementarStock(producto: any) {
    const nuevoStock = (producto.stock || 0) + 1;
    this.productosService.actualizarStock(producto.id, nuevoStock).subscribe(
      updatedProducto => {
        producto.stock = updatedProducto.stock; // Actualiza el valor local con la respuesta del servidor
        this.aplicarFiltros(); // Reaplicar filtros para actualizar la vista
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
          this.aplicarFiltros(); // Reaplicar filtros para actualizar la vista
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
            this.aplicarFiltros();
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
