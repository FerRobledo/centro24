import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { ProductoDTO } from 'src/assets/dto/producto';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() mostrarFormulario: boolean = false;
  @Input() modoEdicion: boolean = false;
  @Input() producto: ProductoDTO = new ProductoDTO();
  @Input() cargando: boolean = false;
  @Input() mensaje: string = '';
  @Input() esAdmin: boolean = false;

  @Output() guardar = new EventEmitter<ProductoDTO>();
  @Output() cancelar = new EventEmitter<void>();

  productoLocal: ProductoDTO = new ProductoDTO();

  ngOnInit() {
    this.productoLocal = new ProductoDTO(this.producto);
  }

  ngOnChanges() {
    this.productoLocal = new ProductoDTO(this.producto);
  }

  onGuardar() {
    this.guardar.emit(this.productoLocal);
  }

  onCancelar() {
    this.cancelar.emit();
  }
  
}
