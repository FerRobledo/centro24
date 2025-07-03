import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductosService } from 'src/app/services/productos.service';
import { AuthService } from 'src/app/services/auth.service';
import { Producto, ProductoDTO } from 'src/assets/dto/producto';
import { MatTableDataSource } from '@angular/material/table';
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

export class ProductosComponent implements OnInit {
  productos: ProductoDTO[] = [];
  productosFiltrados: ProductoDTO[] = [];
  productosAux: ProductoDTO[] = [];
  categoriasUnicas: string[] = [];
  cantidadModificar: number | null = null;
  categoriaSeleccionada: string = '';   // Filtro principal (categoría)

  mostrarFormulario: boolean = false;
  modoEdicion: boolean = false;
  productoEditando: ProductoDTO | null = null;
  mostrarConfirmacion: boolean = false;
  productoAEliminar: ProductoDTO | null = null;
  cargando: boolean = false;
  mensaje: string = '';
  nuevoProducto: ProductoDTO = new ProductoDTO();
  filtroTexto: string = '';

  // Variable para mantener el formato argentino en el input
  precioCostoInput: string = '';

  constructor(
    private productosService: ProductosService, 
    private authService: AuthService,
    private logsService: LogsService
    ) {
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
        this.productosFiltrados = this.productos;
        this.productosAux = this.productos;
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

  // Filtro por texto
  applyFilter() {
    let encontro: boolean = false;
    const filtroLower = this.filtroTexto.toLowerCase();

    // Si el filtro es numérico (sin letras), intentamos buscar por ID
    const esNumerico = /^[0-9]+$/.test(filtroLower);
    if (esNumerico) {
      const porId = this.productosAux.filter(p => p.id.toString() === filtroLower);
      if (porId.length > 0) {
        this.productosFiltrados = porId;
        encontro = true;
      }
    }
    if (!encontro) {
      // Si no hay coincidencia por ID, filtrar por nombre o dirección
      this.productosFiltrados = this.productosAux.filter(p =>
        p.id.toLowerCase().includes(filtroLower) ||
        p.categoria.toLowerCase().includes(filtroLower)
      );
    }
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
    // Crear una copia del producto con el stock incrementado
    const productoActualizado = new ProductoDTO({
      ...producto,
      stock: (producto.stock || 0) + 1
    });

    const error = productoActualizado.validateRequired();
    if (error) {
      alert(error);
      return;
    }

    this.productosService.actualizarProducto(productoActualizado).subscribe({
      next: (updatedProducto: Producto) => {
        console.log('Respuesta del servidor:', updatedProducto);
        const index = this.productos.findIndex(p => p.id === producto.id);
        if (index !== -1) {
          this.productos[index] = new ProductoDTO({ ...this.productos[index], ...updatedProducto });
          // Actualizar el producto en el array principal
          this.productos[index] = new ProductoDTO({
            ...this.productos[index],
            ...updatedProducto
          });
          this.aplicarFiltros();
        }
      },
      error: (error: any) => {
        console.error('Error al incrementar stock:', error);
        console.log('Detalles del error:', error.error);
        alert('Error al incrementar el stock. Verifica los datos o contacta al administrador. Detalle: ' + (error.error?.error || 'Sin detalles'));
      }
    });
  }

  decrementarStock(producto: ProductoDTO) {
    if (producto.stock > 0) {
      const productoActualizado = new ProductoDTO({
        ...producto,
        stock: (producto.stock || 0) - 1
      });

      const error = productoActualizado.validateRequired();
      if (error) {
        alert(error);
        return;
      }

      console.log('Intentando decrementar stock. Producto:', productoActualizado);
      this.productosService.actualizarProducto(productoActualizado).subscribe({
        next: (updatedProducto: Producto) => {
          console.log('Respuesta del servidor:', updatedProducto);
          const index = this.productos.findIndex(p => p.id === producto.id);
          if (index !== -1) {
            this.productos[index] = new ProductoDTO({
              ...this.productos[index],
              ...updatedProducto
            });
            this.aplicarFiltros();
          }
        },
        error: (error: any) => {
          console.error('Error al decrementar stock:', error);
          console.log('Detalles del error:', error.error);
          alert('Error al decrementar el stock. Verifica los datos o contacta al administrador. Detalle: ' + (error.error?.error || 'Sin detalles'));
        }
      });
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
      const productoActualizado = new ProductoDTO({
        ...producto,
        stock: nuevoStock
      });

      const error = productoActualizado.validateRequired();
      if (error) {
        alert(error);
        return;
      }

      console.log('Intentando modificar stock. Producto:', productoActualizado);
      this.productosService.actualizarProducto(productoActualizado).subscribe({
        next: (updatedProducto: Producto) => {
          console.log('Respuesta del servidor:', updatedProducto);
          const index = this.productos.findIndex(p => p.id === producto.id);
          if (index !== -1) {
            this.productos[index] = new ProductoDTO({
              ...this.productos[index],
              ...updatedProducto
            });
            producto.cantidadModificar = null;
            this.aplicarFiltros();
          }
        },
        error: (error: any) => {
          console.error('Error al modificar stock:', error);
          console.log('Detalles del error:', error.error);
          alert('Error al modificar el stock. Verifica los datos o contacta al administrador. Detalle: ' + (error.error?.error || 'Sin detalles'));
        }
      });
    } else {
      alert('No puedes restar más stock del que hay disponible. Stock actual: ' + producto.stock);
      producto.cantidadModificar = null;
    }
  }

  modificarGanancia(producto: ProductoDTO) {
    const nuevoPrecioVenta = producto.precio_costo * (1 + (producto.ganancia || 0) / 100);
    const productoActualizado = new ProductoDTO({
      ...producto,
      ganancia: producto.ganancia,
      precio_venta: nuevoPrecioVenta
    });

    const error = productoActualizado.validateRequired();
    if (error) {
      alert(error);
      return;
    }

    console.log('Intentando modificar ganancia. Producto:', productoActualizado);
    this.productosService.actualizarProducto(productoActualizado).subscribe({
      next: (updatedProducto: Producto) => {
        console.log('Respuesta del servidor:', updatedProducto);
        const index = this.productos.findIndex(p => p.id === producto.id);
        if (index !== -1) {
          this.productos[index] = new ProductoDTO({
            ...this.productos[index],
            ...updatedProducto
          });
          this.aplicarFiltros();
        }
      },
      error: (error: any) => {
        console.error('Error al modificar ganancia:', error);
        console.log('Detalles del error:', error.error);
        alert('Error al modificar la ganancia. Verifica los datos o contacta al administrador. Detalle: ' + (error.error?.error || 'Sin detalles'));
      }
    });
  }

  addProducto() {
    this.mensaje = '';
    this.cargando = true;

    // Si el usuario no es admin, establecer valores por defecto para campos sensibles
    if (!this.esAdmin()) {
      this.nuevoProducto.precio_costo = 0; // Valor por defecto
      this.nuevoProducto.ganancia = 0; // Valor por defecto
    }

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
    this.modoEdicion = false;
    this.productoEditando = null;
    this.nuevoProducto = new ProductoDTO();
    this.mensaje = '';
    this.cargando = false;

    // Limpiar el input del precio de costo
    this.precioCostoInput = '';
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

  editarProducto(producto: ProductoDTO) {
    this.modoEdicion = true;
    this.productoEditando = new ProductoDTO(producto);
    this.nuevoProducto = new ProductoDTO(producto);
    this.mostrarFormulario = true;
    this.mensaje = '';

    // Inicializar el input con formato argentino
    this.precioCostoInput = this.convertirAFormatoArgentino(this.nuevoProducto.precio_costo);
  }

  guardarProducto() {
    if (this.modoEdicion) {
      this.actualizarProducto();
    } else {
      this.addProducto();
    }
  }

  actualizarProducto() {
    this.mensaje = '';
    this.cargando = true;

    const user_id = this.authService.getIdAdmin();
    if (!user_id) {
      alert('Debes estar logeado para actualizar un producto');
      this.cargando = false;
      return;
    }

    // Si el usuario no es admin, preservar los valores originales de precio_costo y ganancia
    let productoParaActualizar = { ...this.nuevoProducto };

    if (!this.esAdmin() && this.productoEditando) {
      // Mantener los valores originales que el usuario no admin no puede modificar
      productoParaActualizar.precio_costo = this.productoEditando.precio_costo;
      productoParaActualizar.ganancia = this.productoEditando.ganancia;
    }

    // Calcular el precio de venta
    const precio_venta = productoParaActualizar.precio_costo + (productoParaActualizar.precio_costo * (productoParaActualizar.ganancia || 0) / 100);
    const productoActualizado = new ProductoDTO({
      ...productoParaActualizar,
      precio_venta
    });

    const error = productoActualizado.validateRequired();
    if (error) {
      alert(error);
      this.cargando = false;
      return;
    }

    this.productosService.actualizarProducto(productoActualizado).subscribe({
      next: (updatedProducto: Producto) => {
        console.log('Producto actualizado:', updatedProducto);
        this.mensaje = 'Producto actualizado con éxito.';
        this.cargando = false;

        // Actualizar el producto en el array
        const index = this.productos.findIndex(p => p.id === updatedProducto.id);
        if (index !== -1) {
          this.productos[index] = new ProductoDTO(updatedProducto);
          this.aplicarFiltros();

          // Actualizar categorías únicas si es necesario
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        }

        // Crear el log 
        const nuevoLog: Log = {
          id_producto: this.productoEditando!.id,
          id_user: this.authService.getUserId(),
          accion: 'actualizacion',
          date: new Date(),
          user_admin: this.authService.getIdAdmin()
        };

        // Agregar log a la base de datos
        this.logsService.crearLog(nuevoLog).subscribe({
          next: (logCreado) => {
            console.log('Log de eliminación creado:', logCreado);
          },
          error: (errorLog) => {
            console.error('Error al crear log de eliminación:', errorLog);
          }
        });

        this.cancelar();
      },
      error: (error: any) => {
        console.error('Error al actualizar producto:', error);
        this.mensaje = 'Hubo un problema al actualizar el producto. Por favor, intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  abrirFormularioAgregar() {
    this.modoEdicion = false;
    this.productoEditando = null;
    this.nuevoProducto = new ProductoDTO();
    this.mostrarFormulario = true;
    this.mensaje = '';

    // Limpiar el input del precio de costo
    this.precioCostoInput = '';
  }

  confirmarEliminar(producto: ProductoDTO) {
    this.productoAEliminar = producto;
    this.mostrarConfirmacion = true;
  }

  eliminarProducto() {
    if (!this.productoAEliminar) return;

    this.cargando = true;
    this.productosService.eliminarProducto(this.productoAEliminar).subscribe({
      next: (response: any) => {
        console.log('Producto eliminado:', response);
        // Remover el producto del array local
        this.productos = this.productos.filter(p => p.id !== this.productoAEliminar!.id);

        // Volver a cargar los productos
        const idAdmin = this.authService.getIdAdmin();
        this.cargarProductos(idAdmin);

        // Aplicar todos los filtros
        this.aplicarFiltros();

        // Actualizar categorías únicas
        this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoria))];
        // Crear el log usando la interfaz Log
        const nuevoLog: Log = {
          id_producto: this.productoAEliminar!.id,
          id_user: this.authService.getUserId(),
          accion: 'eliminacion',
          date: new Date(),
          user_admin: this.authService.getIdAdmin()
        };
        // Agregar log a la base de datos
        this.logsService.crearLog(nuevoLog).subscribe({
          next: (logCreado) => {
            console.log('Log de eliminación creado:', logCreado);
          },
          error: (errorLog) => {
            console.error('Error al crear log de eliminación:', errorLog);
          }
        });
        
        this.cancelarEliminar();
      },
      error: (error: any) => {
        console.error('Error al eliminar producto:', error);
        this.cargando = false;
        alert('Error al eliminar el producto. Detalle: ' + (error.error?.message || 'Sin detalles'));
      }
    });
  }

  cancelarEliminar() {
    this.mostrarConfirmacion = false;
    this.productoAEliminar = null;
    this.cargando = false;
  }

  // Función para formatear el número según el formato argentino (convierte de argentino a número)
  formatearNumeroArgentino(valor: string): number {
    if (!valor) return 0;

    // Convertir a string si viene como número
    const valorStr = valor.toString();

    // Si contiene coma, es decimal (formato argentino)
    if (valorStr.includes(',')) {
      // Separar parte entera y decimal
      const partes = valorStr.split(',');
      const parteEntera = partes[0].replace(/\./g, ''); // Quitar puntos de miles
      const parteDecimal = partes[1] || '0';

      // Formar el número en formato estándar (punto como decimal)
      const numeroFormateado = `${parteEntera}.${parteDecimal}`;
      return parseFloat(numeroFormateado);
    } else {
      // Solo contiene puntos (separadores de miles) o es un número simple
      const numeroSinPuntos = valorStr.replace(/\./g, '');
      return parseInt(numeroSinPuntos, 10);
    }
  }

  // Función para convertir número a formato argentino (para mostrar en el input)
  convertirAFormatoArgentino(numero: number): string {
    if (!numero && numero !== 0) return '';

    const numeroStr = numero.toString();

    // Si tiene decimales
    if (numeroStr.includes('.')) {
      const partes = numeroStr.split('.');
      const parteEntera = partes[0];
      const parteDecimal = partes[1];

      // Formatear parte entera con puntos cada 3 dígitos
      const enteraFormateada = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      return `${enteraFormateada},${parteDecimal}`;
    } else {
      // Solo parte entera, formatear con puntos
      return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  // Función que se ejecuta cuando el usuario termina de editar el precio
  onPrecioCostoChange(event: any) {
    const valorIngresado = event.target.value;
    const numeroFormateado = this.formatearNumeroArgentino(valorIngresado);
    this.nuevoProducto.precio_costo = numeroFormateado;

    // Actualizar el input con el formato argentino correcto
    this.precioCostoInput = this.convertirAFormatoArgentino(numeroFormateado);
    event.target.value = this.precioCostoInput;
  }

  // Función que se ejecuta cuando se enfoca el input
  onPrecioCostoFocus(event: any) {
    // Si el input está vacío y hay un valor en el modelo, mostrar el formato argentino
    if (!event.target.value && this.nuevoProducto.precio_costo) {
      this.precioCostoInput = this.convertirAFormatoArgentino(this.nuevoProducto.precio_costo);
      event.target.value = this.precioCostoInput;
    }
  }

}