import { HttpClient } from '@angular/common/http';
import { compileComponentFromMetadata } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductosService } from 'src/app/services/productos.service';
import { AuthService } from 'src/app/services/auth.service';

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

  mostrarFormulario: boolean = false;
  mensaje: string = ''; // Declarada como propiedad de la clase
  nuevoProducto = { // Declarado como propiedad de la clase
    id: '',
    precio: 0,
    descripcion: '',
    imagen: '',
    stock: 0,
    categoria: '',
    userId: ''
  };

  constructor(private productosService: ProductosService, private authService: AuthService) {
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

  // Funcion para agregar un producto
  addProducto() {

    this.mensaje = '';   // Reseteo el mensaje

    if (!this.nuevoProducto.id || !this.nuevoProducto.precio || !this.nuevoProducto.descripcion || 
        !this.nuevoProducto.stock || !this.nuevoProducto.categoria) {
      this.mensaje = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    const user_id = this.authService.getUserId();   // Se busca el id del usuario creador del producto
    if(!user_id) {
      alert('Debes estar logeado para agregar un producto');
      return;
    }

    if(this.nuevoProducto.stock < 0) {
      this.mensaje = 'El stock no puede ser negativo. Se ha ajustado a 0.';
      this.nuevoProducto.stock = 0; // Resetear a un valor válido
      return;
    }

    if (this.nuevoProducto.precio < 0) {
      this.mensaje = 'El precio no puede ser negativo. Se ha ajustado a 0.';
      this.nuevoProducto.precio = 0; // Resetear a un valor válido
      return;
    }

    this.productosService.addProducto(
      this.nuevoProducto.id,
      this.nuevoProducto.precio,
      this.nuevoProducto.descripcion,
      this.nuevoProducto.imagen,
      this.nuevoProducto.stock,
      this.nuevoProducto.categoria,
      user_id
    ).subscribe(
      (respuesta: any) => {
        this.mensaje = respuesta.message || 'Producto agregado con éxito.';
        this.cancelar(); // Resetea y cierra el formulario
      },
      (error: any) => {
        console.error('Error al agregar producto', error);
        this.mensaje = 'Hubo un problema al agregar el producto. Por favor, intenta de nuevo.';
      }
    );
  }


  // Cancelar
  cancelar() {
    this.mostrarFormulario = false;
    this.nuevoProducto = {
      id: '',
      precio: 0,
      descripcion: '',
      imagen: '',
      stock: 0,
      categoria: '',
      userId: ''
    };
    this.mensaje = '';
  }

  
}
