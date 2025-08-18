import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ProductosService } from 'src/app/services/productos.service';
import { AuthService } from 'src/app/services/auth.service';
import { Producto, ProductoDTO } from 'src/assets/dto/producto';
import { LogsService } from 'src/app/services/logs.service';
import { Log } from 'src/assets/dto/log';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';
import { LogsComponent } from '../logs/logs.component';

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
  categoriasUnicas: string[] = [];
  filtroTexto: string = '';

  mostrarSoloStock: boolean = false;

  // Estados del diálogo de confirmación
  mostrarConfirmacion: boolean = false;
  productoAEliminar: ProductoDTO | null = null;

  productoEditando: ProductoDTO | null = null;

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
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    const idAdmin = this.authService.getIdAdmin();
    this.cargarProductos(idAdmin);
    ;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe(); //limpia todas las suscripciones
  }

  // === MÉTODOS DE CARGA ===
  cargarProductos(idAdmin: number) {
    this.cargandoProducto = true;
    ;

    this.subscriptions.add(
      this.productosService.getProductos(idAdmin).subscribe({
        next: (data: Producto[]) => {
          this.productos = data.map((producto: Producto) => new ProductoDTO(producto));
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          this.cargandoProducto = false;
          ; 
        },
        error: (error) => {
          console.error('Error al obtener productos:', error);
          this.cargandoProducto = false;
          ;
        }
      })
    )
  }

  // === MÉTODOS DE FILTRADO ===

  // Método para el toggle switch
  toggleFiltroStock(checked: boolean) {
    this.mostrarSoloStock = checked;
  }


  // === MÉTODOS DE FORMULARIO ===
  abrirFormularioAgregar() {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      disableClose: false,
      data: {
        producto: new ProductoDTO(),
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

  editarProducto(producto: ProductoDTO) {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      disableClose: false,
      data: {
        producto: producto,
        modoEdicion: true,
        esAdmin: this.esAdmin()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'guardar') {
        this.nuevoProducto = result.producto;
        this.productoEditando = new ProductoDTO(producto); // Necesario para actualizarProducto()
        this.actualizarProducto();
      }
    });
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
      ;
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
            this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          }
          ;
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
            this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          }

          this.crearLog(this.productoEditando!.id, 'actualizacion');
          this.cancelar();
          ;
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
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
          this.crearLog(this.productoAEliminar!.id, 'eliminacion');
          this.cancelarEliminar();
          ;
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


  // === LOGS ===
  abrirLogs() {
    const dialogRef = this.dialog.open(LogsComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '',
      data: {
        titulo: 'Logs de Productos'
      }
    })
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

  detectChanges() {
    ;
  }

}