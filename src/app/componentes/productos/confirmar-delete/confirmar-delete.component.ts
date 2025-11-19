import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductoDTO } from 'src/assets/dto/producto';

@Component({
  selector: 'app-confirmar-delete',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './confirmar-delete.component.html',
})
export class ConfirmarDeleteComponent {
  @Input() mostrar: boolean = false;
  @Input() producto: ProductoDTO | null = null;
  @Input() cargando: boolean = false;

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  onConfirmar() {
    this.confirmar.emit();
  }

  onCancelar() {
    this.cancelar.emit();
  }

}
