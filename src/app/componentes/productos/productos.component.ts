import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ProductosService } from 'src/app/services/productos.service';
import { AuthService } from 'src/app/services/auth.service';
import { Producto, ProductoDTO } from 'src/assets/dto/producto';
import { LogsService } from 'src/app/services/logs.service';
import { Log } from 'src/assets/dto/log';
import { Subscription } from 'rxjs';

interface AddProductoResponse {
  message: string;
  producto?: Producto;
}



@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
})

export class ProductosComponent implements OnInit, OnDestroy {
  productos: ProductoDTO[] = [];
  productosFiltrados: ProductoDTO[] = [];
  categoriasUnicas: string[] = [];
  filtroTexto: string = '';
  filtroStockActivo: boolean = false;
  mostrarSoloStock: boolean = false;

  // Estados del formulario
  mostrarFormulario: boolean = false;
  modoEdicion: boolean = false;
  productoEditando: ProductoDTO | null = null;

  // Estados del diálogo de confirmación
  mostrarConfirmacion: boolean = false;
  productoAEliminar: ProductoDTO | null = null;

  // Estados generales
  cargandoProducto: boolean = false;
  mensaje: string = '';
  nuevoProducto: ProductoDTO = new ProductoDTO();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private logsService: LogsService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    const idAdmin = this.authService.getIdAdmin();
    this.cargarProductos(idAdmin);
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe(); //limpia todas las suscripciones
  }

  // === MÉTODOS DE CARGA ===
  cargarProductos(idAdmin: number) {
    this.cargandoProducto = true;
    this.cdr.detectChanges();

    this.subscriptions.add(
      this.productosService.getProductos(idAdmin).subscribe({
        next: (data: Producto[]) => {
          this.productos = data.map((producto: Producto) => new ProductoDTO(producto));
          this.productosFiltrados = [...this.productos];
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          this.cargandoProducto = false;
          this.cdr.detectChanges(); 
        },
        error: (error) => {
          console.error('Error al obtener productos:', error);
          this.cargandoProducto = false;
          this.cdr.detectChanges();
        }
      })
    )
  }

  // === MÉTODOS DE FILTRADO ===

  // Filtro por texto
  applyFilter() {
    this.aplicarTodosLosFiltros();
    this.cdr.detectChanges();
  }

  aplicarTodosLosFiltros() {
    let resultado = [...this.productos];
    console.log('Productos iniciales:', resultado.length);
    console.log('Filtro stock activo:', this.filtroStockActivo);

    // 1. Filtrar por stock si está activado
    if (this.filtroStockActivo) {
      const productosConStock = resultado.filter(p => p.stock > 0);
      console.log('Productos con stock > 0:', productosConStock.length);
      console.log('Stocks encontrados:', resultado.map(p => ({ id: p.id, stock: p.stock })));
      resultado = productosConStock;
    }

    // 2. Filtrar por texto si hay búsqueda
    if (this.filtroTexto.trim()) {
      const filtroLower = this.filtroTexto.toLowerCase();
      const esNumerico = /^[0-9]+$/.test(filtroLower);

      if (esNumerico) {
        resultado = resultado.filter(p => p.id.toString() === filtroLower);
      } else {
        resultado = resultado.filter(p =>
          p.id.toLowerCase().includes(filtroLower) ||
          (p.descripcion?.toLowerCase() || '').includes(filtroLower) ||
          p.categoria.toLowerCase().includes(filtroLower)
        );
      }
    }

    this.productosFiltrados = resultado;
    console.log('Productos filtrados finales:', this.productosFiltrados.length);
  }

  aplicarFiltros(filtrarStock: boolean = false) {
    // Resetear toggle a "Todos" cuando se aplican filtros después de operaciones CRUD
    this.filtroStockActivo = filtrarStock;
    this.mostrarSoloStock = filtrarStock;
    this.aplicarTodosLosFiltros();
  }

  filtrarStockMayorCero() {
    this.filtroStockActivo = true;
    this.mostrarSoloStock = true;
    this.aplicarTodosLosFiltros();
  }

  mostrarTodos() {
    this.filtroStockActivo = false;
    this.mostrarSoloStock = false;
    this.aplicarTodosLosFiltros();
  }

  // Método para el toggle switch
  toggleFiltroStock(checked: boolean) {
    console.log('Toggle activado:', checked); // Para debug
    this.mostrarSoloStock = checked;
    this.filtroStockActivo = checked;
    this.aplicarTodosLosFiltros();
    console.log('Productos filtrados:', this.productosFiltrados.length); // Para debug
  }


  // === MÉTODOS DE FORMULARIO ===
  abrirFormularioAgregar() {
    this.modoEdicion = false;
    this.productoEditando = null;
    this.nuevoProducto = new ProductoDTO();
    this.mostrarFormulario = true;
    this.mensaje = '';
  }

  editarProducto(producto: ProductoDTO) {
    this.modoEdicion = true;
    this.productoEditando = new ProductoDTO(producto);
    this.nuevoProducto = new ProductoDTO(producto);
    this.mostrarFormulario = true;
    this.mensaje = '';
  }

  onFormGuardar(producto: ProductoDTO) {
    this.nuevoProducto = producto;
    this.guardarProducto();
  }

  onFormCancelar() {
    this.cancelar();
  }

  guardarProducto() {
    if (this.modoEdicion) {
      this.actualizarProducto();
    } else {
      this.addProducto();
    }
  }

  addProducto() {
    this.mensaje = '';
    this.cargandoProducto = true;

    if (!this.esAdmin()) {
      this.nuevoProducto.precio_costo = 0;
      this.nuevoProducto.ganancia = 0;
    }

    const error = this.nuevoProducto.validateRequired();
    if (error) {
      this.mensaje = error;
      this.cargandoProducto = false;
      this.cdr.detectChanges();
      return;
    }

    const user_id = this.authService.getUserId();
    if (!user_id) {
      this.mensaje = 'Debes estar logeado para agregar un producto';
      this.cargandoProducto = false;
      return;
    }

    const precio_venta = this.nuevoProducto.precio_costo + (this.nuevoProducto.precio_costo * (this.nuevoProducto.ganancia || 0) / 100);
    const productoConPrecio = new ProductoDTO({ ...this.nuevoProducto, precio_venta, id_admin: user_id });

    this.subscriptions.add(

      this.productosService.addProducto(productoConPrecio).subscribe({
        next: (respuesta: AddProductoResponse) => {
          this.mensaje = respuesta.message || 'Producto agregado con éxito.';
          this.cargandoProducto = false;
          if (respuesta.producto) {
            this.productos.push(new ProductoDTO(respuesta.producto));
            this.aplicarFiltros();
            this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          }
          this.cdr.detectChanges();
          this.cancelar();
        },
        error: (error: any) => {
          console.error('Error al agregar producto', error);
          this.mensaje = 'Hubo un problema al agregar el producto.';
          this.cargandoProducto = false;
        }
      })
    );
  }

  actualizarProducto() {
    this.mensaje = '';
    this.cargandoProducto = true;

    const user_id = this.authService.getIdAdmin();
    if (!user_id) {
      this.mensaje = 'Debes estar logeado para actualizar un producto';
      this.cargandoProducto = false;
      return;
    }

    let productoParaActualizar = { ...this.nuevoProducto };

    if (!this.esAdmin() && this.productoEditando) {
      productoParaActualizar.precio_costo = this.productoEditando.precio_costo;
      productoParaActualizar.ganancia = this.productoEditando.ganancia;
    }

    const precio_venta = productoParaActualizar.precio_costo + (productoParaActualizar.precio_costo * (productoParaActualizar.ganancia || 0) / 100);
    const productoActualizado = new ProductoDTO({ ...productoParaActualizar, precio_venta });

    const error = productoActualizado.validateRequired();
    if (error) {
      this.mensaje = error;
      this.cargandoProducto = false;
      return;
    }

    this.subscriptions.add(
      this.productosService.actualizarProducto(productoActualizado).subscribe({
        next: (updatedProducto: Producto) => {
          this.mensaje = 'Producto actualizado con éxito.';
          this.cargandoProducto = false;

          const index = this.productos.findIndex(p => p.id === updatedProducto.id);
          if (index !== -1) {
            this.productos[index] = new ProductoDTO(updatedProducto);
            this.aplicarFiltros();
            this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          }

          this.crearLog(this.productoEditando!.id, 'actualizacion');
          this.cancelar();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error al actualizar producto:', error);
          this.mensaje = 'Hubo un problema al actualizar el producto.';
          this.cargandoProducto = false;
        }
      })
    );
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.productoEditando = null;
    this.nuevoProducto = new ProductoDTO();
    this.mensaje = '';
    this.cargandoProducto = false;
  }


  // === MÉTODOS DE ELIMINACIÓN ===
  confirmarEliminar(producto: ProductoDTO) {
    this.productoAEliminar = producto;
    this.mostrarConfirmacion = true;
  }

  eliminarProducto() {
    if (!this.productoAEliminar) return;

    this.cargandoProducto = true;
    this.subscriptions.add(
      this.productosService.eliminarProducto(this.productoAEliminar).subscribe({
        next: (response: any) => {
          this.productos = this.productos.filter(p => p.id !== this.productoAEliminar!.id);
          this.aplicarFiltros();
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          this.crearLog(this.productoAEliminar!.id, 'eliminacion');
          this.cancelarEliminar();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error al eliminar producto:', error);
          this.cargandoProducto = false;
        }
      })
    )
  }

  cancelarEliminar() {
    this.mostrarConfirmacion = false;
    this.productoAEliminar = null;
    this.cargandoProducto = false;
  }


  // === MÉTODOS DE UTILIDAD ===
  esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  crearLog(idProducto: string, accion: string) {
    const nuevoLog: Log = {
      id_producto: idProducto,
      id_user: this.authService.getUserId(),
      accion: accion,
      date: new Date(),
      user_admin: this.authService.getIdAdmin()
    };

    this.logsService.crearLog(nuevoLog).subscribe({
      next: (logCreado) => console.log('Log creado:', logCreado),
      error: (errorLog) => console.error('Error al crear log:', errorLog)
    });
  }

  // === MÉTODOS DE EVENTOS DE CARGA ===
  onCargaCompleta() {
    this.cargandoProducto = false;
    const idAdmin = this.authService.getIdAdmin();
    this.cargarProductos(idAdmin);
  }

  onCargaIniciada() {
    this.cargandoProducto = true;
    this.mensaje = 'Procesando productos esto puede tardar unos segundos...';
  }

}