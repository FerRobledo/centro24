import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductosService } from 'src/app/services/productos.service';
import { AuthService } from 'src/app/services/auth.service';
import { Producto, ProductoDTO } from 'src/assets/dto/producto';
import { LogsService } from 'src/app/services/logs.service';
import { Log } from 'src/assets/dto/log';

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

  // Estados del formulario
  mostrarFormulario: boolean = false;
  modoEdicion: boolean = false;
  productoEditando: ProductoDTO | null = null;
  
  // Estados del diálogo de confirmación
  mostrarConfirmacion: boolean = false;
  productoAEliminar: ProductoDTO | null = null;
  
  // Estados generales
  cargando: boolean = false;
  mensaje: string = '';
  nuevoProducto: ProductoDTO = new ProductoDTO();

  constructor(
    private productosService: ProductosService, 
    private authService: AuthService,
    private logsService: LogsService
    ) {
    console.log('Componente AppComponent inicializado (desde constructor)');
  }

  ngOnInit() {
    const idAdmin = this.authService.getIdAdmin();
    this.cargarProductos(idAdmin);
  }

  ngOnDestroy(): void {
    console.log("destroy productos")
  }

  // === MÉTODOS DE CARGA ===
  cargarProductos(idAdmin: number) {
    this.mensaje = 'Cargando productos...';
    this.cargando = true;
    this.productosService.getProductos(idAdmin).subscribe({
      next: (data: Producto[]) => {
        this.productos = data.map((producto: Producto) => new ProductoDTO(producto));
        this.productosFiltrados = [...this.productos];
        this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        this.cargando = false;
      }
    });
  }

  // === MÉTODOS DE FILTRADO ===

  // Filtro por texto
  applyFilter() {
    this.aplicarTodosLosFiltros();
  }

  aplicarTodosLosFiltros() {
    let resultado = [...this.productos];

    // 1. Filtrar por stock si está activado
    if (this.filtroStockActivo) {
      resultado = resultado.filter(p => p.stock > 0);
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
  }

  aplicarFiltros(filtrarStock: boolean = false) {
    this.filtroStockActivo = filtrarStock;
    this.aplicarTodosLosFiltros();
  }

  filtrarStockMayorCero() {
    this.filtroStockActivo = true;
    this.aplicarTodosLosFiltros();
  }

  mostrarTodos() {
    this.filtroStockActivo = false;
    this.aplicarTodosLosFiltros();
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
    this.cargando = true;

    if (!this.esAdmin()) {
      this.nuevoProducto.precio_costo = 0;
      this.nuevoProducto.ganancia = 0;
    }

    const error = this.nuevoProducto.validateRequired();
    if (error) {
      this.mensaje = error;
      this.cargando = false;
      return;
    }

    const user_id = this.authService.getUserId();
    if (!user_id) {
      this.mensaje = 'Debes estar logeado para agregar un producto';
      this.cargando = false;
      return;
    }

    const precio_venta = this.nuevoProducto.precio_costo + (this.nuevoProducto.precio_costo * (this.nuevoProducto.ganancia || 0) / 100);
    const productoConPrecio = new ProductoDTO({ ...this.nuevoProducto, precio_venta, id_admin: user_id });

    this.productosService.addProducto(productoConPrecio).subscribe({
      next: (respuesta: AddProductoResponse) => {
        this.mensaje = respuesta.message || 'Producto agregado con éxito.';
        this.cargando = false;
        if (respuesta.producto) {
          this.productos.push(new ProductoDTO(respuesta.producto));
          this.aplicarFiltros();
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        }
        this.cancelar();
      },
      error: (error: any) => {
        console.error('Error al agregar producto', error);
        this.mensaje = 'Hubo un problema al agregar el producto.';
        this.cargando = false;
      }
    });
  }

  actualizarProducto() {
    this.mensaje = '';
    this.cargando = true;

    const user_id = this.authService.getIdAdmin();
    if (!user_id) {
      this.mensaje = 'Debes estar logeado para actualizar un producto';
      this.cargando = false;
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
      this.cargando = false;
      return;
    }

    this.productosService.actualizarProducto(productoActualizado).subscribe({
      next: (updatedProducto: Producto) => {
        this.mensaje = 'Producto actualizado con éxito.';
        this.cargando = false;

        const index = this.productos.findIndex(p => p.id === updatedProducto.id);
        if (index !== -1) {
          this.productos[index] = new ProductoDTO(updatedProducto);
          this.aplicarFiltros();
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        }

        this.crearLog(this.productoEditando!.id, 'actualizacion');
        this.cancelar();
      },
      error: (error: any) => {
        console.error('Error al actualizar producto:', error);
        this.mensaje = 'Hubo un problema al actualizar el producto.';
        this.cargando = false;
      }
    });
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.productoEditando = null;
    this.nuevoProducto = new ProductoDTO();
    this.mensaje = '';
    this.cargando = false;
  }


  // === MÉTODOS DE ELIMINACIÓN ===
  confirmarEliminar(producto: ProductoDTO) {
    this.productoAEliminar = producto;
    this.mostrarConfirmacion = true;
  }

  eliminarProducto() {
    if (!this.productoAEliminar) return;

    this.cargando = true;
    this.productosService.eliminarProducto(this.productoAEliminar).subscribe({
      next: (response: any) => {
        this.productos = this.productos.filter(p => p.id !== this.productoAEliminar!.id);
        this.aplicarFiltros();
        this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        this.crearLog(this.productoAEliminar!.id, 'eliminacion');
        this.cancelarEliminar();
      },
      error: (error: any) => {
        console.error('Error al eliminar producto:', error);
        this.cargando = false;
      }
    });
  }

  cancelarEliminar() {
    this.mostrarConfirmacion = false;
    this.productoAEliminar = null;
    this.cargando = false;
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
    this.cargando = false;
    const idAdmin = this.authService.getIdAdmin();
    this.cargarProductos(idAdmin);
  }

  onCargaIniciada() {
    this.cargando = true;
    this.mensaje = 'Procesando productos esto puede tardar unos segundos...';
  }

}