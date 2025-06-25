import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductosService } from 'src/app/services/productos.service';
import { AuthService } from 'src/app/services/auth.service';
import { Producto, ProductoDTO } from 'src/assets/dto/producto';

interface AddProductoResponse {
  message: string;
  producto?: Producto;
}



@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
})

export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: ProductoDTO[] = [];
  categoriasUnicas: string[] = [];
  cantidadModificar: number | null = null;
  categoriaSeleccionada: string = '';   // Filtro principal (categoría)

  mostrarFormulario: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  nuevoProducto: ProductoDTO = new ProductoDTO();

  constructor(private productosService: ProductosService, private authService: AuthService) {
    console.log('Componente AppComponent inicializado');
  }

  ngOnInit() {
    const idAdmin = this.authService.getIdAdmin();
    this.cargarProductos(idAdmin);
  }

  cargarProductos(idAdmin: number) {
    this.mensaje = 'Cargando productos...';
    this.cargando = true;
    this.productosService.getProductos(idAdmin).subscribe({
      next: (data: Producto[]) => {
        this.productos = data.map((producto: Producto) => new ProductoDTO({ ...producto, cantidadModificar: null }));
        this.productosFiltrados = this.productos.map(p => new ProductoDTO(p));
        this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        console.log('Datos recibidos:', data);
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
      },
      complete: () => {
        this.cargando = false;
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

    if (this.categoriaSeleccionada) {
      resultado = resultado.filter(p => p.categoria === this.categoriaSeleccionada);
    }

    if (filtrarStock) {
      resultado = resultado.filter(p => p.stock > 0);
    }

    this.productosFiltrados = resultado.map(p => new ProductoDTO(p));

    console.log('Filtros aplicados. Resultado:', this.productosFiltrados);
  }

  incrementarStock(producto: ProductoDTO) {
    const nuevoProducto = new ProductoDTO({ ...producto, stock: (producto.stock || 0) + 1 });
    const error = nuevoProducto.validateRequired();
    if (error) {
      alert(error);
      return;
    }
    this.productosService.actualizarProducto(nuevoProducto).subscribe(
      (updatedProducto: Producto) => {
        console.log('Respuesta del servidor:', updatedProducto);
        const index = this.productos.findIndex(p => p.id === producto.id);
        if (index !== -1) {
          this.productos[index] = new ProductoDTO({ ...this.productos[index], ...updatedProducto });
          this.aplicarFiltros();
        }
      },
      (error: any) => {
        console.error('Error al incrementar stock:', error);
        console.log('Detalles del error:', error.error);
        alert('Error al incrementar el stock. Verifica los datos o contacta al administrador. Detalle: ' + (error.error?.error || 'Sin detalles'));
      }
    );
  }

  decrementarStock(producto: ProductoDTO) {
    if (producto.stock > 0) {
      const nuevoProducto = new ProductoDTO({ ...producto, stock: (producto.stock || 0) - 1 });
      const error = nuevoProducto.validateRequired();
      if (error) {
        alert(error);
        return;
      }
      console.log('Intentando decrementar stock. Producto:', nuevoProducto);
      this.productosService.actualizarProducto(nuevoProducto).subscribe(
        (updatedProducto: Producto) => {
          console.log('Respuesta del servidor:', updatedProducto);
          const index = this.productos.findIndex(p => p.id === producto.id);
          if (index !== -1) {
            this.productos[index] = new ProductoDTO({ ...this.productos[index], ...updatedProducto });
            this.aplicarFiltros();
          }
        },
        (error: any) => {
          console.error('Error al decrementar stock:', error);
          console.log('Detalles del error:', error.error);
          alert('Error al decrementar el stock. Verifica los datos o contacta al administrador. Detalle: ' + (error.error?.error || 'Sin detalles'));
        }
      );
    }
  }

  modificarStock(producto: ProductoDTO) {
    console.log('Se llamó a modificarStock con:', producto);
    if (producto.cantidadModificar === null || producto.cantidadModificar === undefined || producto.cantidadModificar === 0) {
      alert('Debe ingresar una cantidad válida para modificar el stock.');
      producto.cantidadModificar = null;
      return;
    }

    const cambio = producto.cantidadModificar;
    const nuevoStock = (producto.stock || 0) + cambio;
    if (nuevoStock >= 0) {
      const nuevoProducto = new ProductoDTO({ ...producto, stock: nuevoStock });
      const error = nuevoProducto.validateRequired();
      if (error) {
        alert(error);
        return;
      }
      console.log('Intentando modificar stock. Producto:', nuevoProducto);
      this.productosService.actualizarProducto(nuevoProducto).subscribe(
        (updatedProducto: Producto) => {
          console.log('Respuesta del servidor:', updatedProducto);
          const index = this.productos.findIndex(p => p.id === producto.id);
          if (index !== -1) {
            this.productos[index] = new ProductoDTO({ ...this.productos[index], ...updatedProducto });
            producto.cantidadModificar = null;
            this.aplicarFiltros();
          }
        },
        (error: any) => {
          console.error('Error al modificar stock:', error);
          console.log('Detalles del error:', error.error);
          alert('Error al modificar el stock. Verifica los datos o contacta al administrador. Detalle: ' + (error.error?.error || 'Sin detalles'));
        }
      );
    } else {
      alert('No puedes restar más stock del que hay disponible. Stock actual: ' + producto.stock);
      producto.cantidadModificar = null;
    }
  }

  modificarGanancia(producto: ProductoDTO) {
    const nuevoPrecioVenta = producto.precio_costo * (1 + (producto.ganancia || 0) / 100);
    const nuevoProducto = new ProductoDTO({ ...producto, ganancia: producto.ganancia, precio_venta: nuevoPrecioVenta });
    const error = nuevoProducto.validateRequired();
    if (error) {
      alert(error);
      return;
    }
    console.log('Intentando modificar ganancia. Producto:', nuevoProducto);
    this.productosService.actualizarProducto(nuevoProducto).subscribe(
      (updatedProducto: Producto) => {
        console.log('Respuesta del servidor:', updatedProducto);
        const index = this.productos.findIndex(p => p.id === producto.id);
        if (index !== -1) {
          this.productos[index] = new ProductoDTO({ ...this.productos[index], ...updatedProducto });
          this.aplicarFiltros();
        }
      },
      (error: any) => {
        console.error('Error al modificar ganancia:', error);
        console.log('Detalles del error:', error.error);
        alert('Error al modificar la ganancia. Verifica los datos o contacta al administrador. Detalle: ' + (error.error?.error || 'Sin detalles'));
      }
    );
  }

  addProducto() {
    this.mensaje = '';
    this.cargando = true;

    const error = this.nuevoProducto.validateRequired();
    if (error) {
      this.mensaje = error;
      this.cargando = false;
      return;
    }

    const user_id = this.authService.getUserId();
    if (!user_id) {
      alert('Debes estar logeado para agregar un producto');
      this.cargando = false;
      return;
    }

    const precio_venta = this.nuevoProducto.precio_costo + (this.nuevoProducto.precio_costo * (this.nuevoProducto.ganancia || 0) / 100);
    const productoConPrecio = new ProductoDTO({ ...this.nuevoProducto, precio_venta, id_admin: user_id });

    this.productosService.addProducto(productoConPrecio).subscribe(
      (respuesta: AddProductoResponse) => {
        this.mensaje = respuesta.message || 'Producto agregado con éxito.';
        this.cargando = false;
        if (respuesta.producto) {
          this.productos.push(new ProductoDTO(respuesta.producto));
          this.aplicarFiltros();
        }
        if (respuesta.producto && !this.categoriasUnicas.includes(respuesta.producto.categoria)) {
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        }
        this.cancelar();
      },
      (error: any) => {
        console.error('Error al agregar producto', error);
        this.mensaje = 'Hubo un problema al agregar el producto. Por favor, intenta de nuevo.';
        this.cargando = false;
      }
    );
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.nuevoProducto = new ProductoDTO();
    this.mensaje = '';
    this.cargando = false;
  }

  onCargaCompleta() {
    this.cargando = false;
    const idAdmin = this.authService.getIdAdmin();
    this.cargarProductos(idAdmin)
  }

  onCargaIniciada() {
    this.cargando = true;
    this.mensaje = 'Procesando productos esto puede tardar unos segundos...';
  }

  esAdmin() {
    return this.authService.esAdmin();
  }

  /*
  eliminarProducto(producto: ProductoDTO) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    this.productosService.eliminarProducto(producto).subscribe(
      (response: any) => {
        console.log('Producto eliminado:', response);
        this.productos = this.productos.filter(p => p.id !== producto.id);
        this.aplicarFiltros();
        alert('Producto eliminado exitosamente');
      },
      (error: any) => {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto. Detalle: ' + (error.error?.error || 'Sin detalles'));
      }
    );
  }

*/

}