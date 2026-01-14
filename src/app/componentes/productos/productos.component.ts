import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ProductosService } from 'src/app/services/productos.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Producto } from 'src/assets/dto/producto';
import { LogsService } from 'src/app/services/logs.service';
import { Log } from 'src/assets/dto/log';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';
import { LogsComponent } from './logs/logs.component';
import { FormsModule } from '@angular/forms';
import { CargaProductosComponent } from './cargaProductos/cargaProductos.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmarDeleteComponent } from './confirmar-delete/confirmar-delete.component';
import { CommonModule } from '@angular/common';
import { FiltroProductosPipe } from 'src/app/pipes/filtro-productos.pipe';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, CargaProductosComponent, MatSlideToggle, MatTooltipModule, ConfirmarDeleteComponent, FiltroProductosPipe],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  categoriasUnicas: string[] = [];
  filtroTexto: string = '';
  mostrarSoloStock: boolean = false;

  // Estados del diálogo de confirmación
  mostrarConfirmacion: boolean = false;
  productoAEliminar: Producto | null = null;

  productoEditando: Producto | null = null;

  // Estados generales
  cargandoProducto: boolean = false;
  mensaje: string = '';
  nuevoProducto: Producto = {
    id: '',
    precio_costo: 0,
    descripcion: null,
    imagen: null,
    stock: 0,
    categoria: '',
    id_admin: 0,
    ganancia: null,
    precio_venta: 0,
    cantidadModificar: null
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private logsService: LogsService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargarProductos();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // === MÉTODOS DE CARGA ===
  cargarProductos() {
    this.cargandoProducto = true;
    const idAdmin = this.authService.getIdAdmin();
    this.subscriptions.add(
      this.productosService.getProductos(idAdmin).subscribe({
        next: (data: Producto[]) => {
          console.log('📦 Productos recibidos del backend:', data);
          console.log('📊 Cantidad de productos:', data.length);
          this.productos = data;
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          this.cargandoProducto = false;
        },
        error: (error) => {
          console.error('Error al obtener productos:', error);
          this.cargandoProducto = false;
        }
      })
    );
  }

  // === MÉTODOS DE FILTRADO ===
  toggleFiltroStock(checked: boolean) {
    this.mostrarSoloStock = checked;
  }

  // === MÉTODOS DE FORMULARIO ===
  abrirFormularioAgregar() {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      disableClose: false,
      data: {
        producto: {
          id: '',
          precio_costo: 0,
          descripcion: null,
          imagen: null,
          stock: 0,
          categoria: '',
          id_admin: this.authService.getIdAdmin(),
          ganancia: null,
          precio_venta: 0,
          cantidadModificar: null
        },
        modoEdicion: false,
        esAdmin: this.esAdmin()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'guardar') {
        this.nuevoProducto = result.producto;
        this.addProducto();
      }
    });
  }

  editarProducto(producto: Producto) {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      disableClose: false,
      data: {
        producto: { ...producto },
        modoEdicion: true,
        esAdmin: this.esAdmin()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'guardar') {
        this.nuevoProducto = result.producto;
        this.productoEditando = { ...producto };
        this.actualizarProducto();
      }
    });
  }

  addProducto() {
    this.mensaje = '';
    this.cargandoProducto = true;
    const idAdmin = this.authService.getIdAdmin();

    // Validación básica
    if (!this.nuevoProducto.id || !this.nuevoProducto.categoria || this.nuevoProducto.precio_costo < 0) {
      this.mensaje = 'Por favor completa todos los campos requeridos correctamente';
      this.cargandoProducto = false;
      return;
    }

    if (!this.esAdmin()) {
      this.nuevoProducto.precio_costo = 0;
      this.nuevoProducto.ganancia = 0;
    }

    const productoParaEnviar: Producto = {
      ...this.nuevoProducto,
      id_admin: idAdmin,
      precio_venta: this.nuevoProducto.precio_costo * (1 + (this.nuevoProducto.ganancia || 0) / 100)
    };

    this.subscriptions.add(
      this.productosService.crearProducto(productoParaEnviar).subscribe({
        next: (respuesta: any) => {
          this.mensaje = 'Producto agregado con éxito.';
          this.cargandoProducto = false;
          this.productos.push(respuesta.producto || respuesta);
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          this.cancelar();
          this.cargarProductos();
        },
        error: (error: any) => {
          console.error('Error al agregar producto', error);
          this.mensaje = error?.error?.error || 'Hubo un problema al agregar el producto.';
          this.cargandoProducto = false;
        }
      })
    );
  }

  actualizarProducto() {
    this.mensaje = '';
    this.cargandoProducto = true;
    const idAdmin = this.authService.getIdAdmin();

    if (!idAdmin) {
      this.mensaje = 'Debes estar logeado para actualizar un producto';
      this.cargandoProducto = false;
      return;
    }

    let productoParaActualizar = { ...this.nuevoProducto };

    if (!this.esAdmin() && this.productoEditando) {
      productoParaActualizar.precio_costo = this.productoEditando.precio_costo;
      productoParaActualizar.ganancia = this.productoEditando.ganancia;
    }

    // Validación básica
    if (!productoParaActualizar.id || !productoParaActualizar.categoria) {
      this.mensaje = 'Por favor completa todos los campos requeridos';
      this.cargandoProducto = false;
      return;
    }

    this.subscriptions.add(
      this.productosService.actualizarProducto(productoParaActualizar).subscribe({
        next: (updatedProducto: any) => {
          this.mensaje = 'Producto actualizado con éxito.';
          this.cargandoProducto = false;

          const index = this.productos.findIndex(p => p.id === updatedProducto.id);
          if (index !== -1) {
            this.productos[index] = updatedProducto;
            this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          }

          this.crearLog(this.productoEditando!.id, 'actualizacion');
          this.cargarProductos();
        },
        error: (error: any) => {
          console.error('Error al actualizar producto:', error);
          this.mensaje = error?.error?.error || 'Hubo un problema al actualizar el producto.';
          this.cargandoProducto = false;
        }
      })
    );
  }

  cancelar() {
    this.nuevoProducto = {
      id: '',
      precio_costo: 0,
      descripcion: null,
      imagen: null,
      stock: 0,
      categoria: '',
      id_admin: 0,
      ganancia: null,
      precio_venta: 0,
      cantidadModificar: null
    };
    this.mensaje = '';
    this.cargandoProducto = false;
  }

  // === MÉTODOS DE ELIMINACIÓN ===
  confirmarEliminar(producto: Producto) {
    this.productoAEliminar = producto;
    this.mostrarConfirmacion = true;
  }

  eliminarProducto() {
    if (!this.productoAEliminar) return;

    this.cargandoProducto = true;
    this.subscriptions.add(
      this.productosService.eliminarProducto(this.productoAEliminar.id).subscribe({
        next: (response: any) => {
          this.productos = this.productos.filter(p => p.id !== this.productoAEliminar!.id);
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          this.crearLog(this.productoAEliminar!.id, 'eliminacion');
          this.cancelarEliminar();
        },
        error: (error: any) => {
          console.error('Error al eliminar producto:', error);
          this.cargandoProducto = false;
        }
      })
    );
  }

  cancelarEliminar() {
    this.mostrarConfirmacion = false;
    this.productoAEliminar = null;
    this.cargandoProducto = false;
  }

  // === LOGS ===
  abrirLogs() {
    this.dialog.open(LogsComponent, {
      width: '90vw',
      maxWidth: '1200px',
      data: {
        titulo: 'Registro de Productos'
      }
    });
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
      error: (errorLog) => console.error('Error al crear log:', errorLog)
    });
  }

  // === MÉTODOS DE EVENTOS DE CARGA ===
  onCargaCompleta() {
    this.cargandoProducto = false;
    this.cargarProductos();
  }

  onCargaIniciada() {
    this.cargandoProducto = true;
    this.mensaje = 'Procesando productos esto puede tardar unos segundos...';
  }
}