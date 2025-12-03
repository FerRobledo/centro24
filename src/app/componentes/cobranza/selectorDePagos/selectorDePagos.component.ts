import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selectorDePagos',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './selectorDePagos.component.html'
})
export class SelectorDePagosComponent implements OnInit {

  constructor() { }

  @Output() deleteSelectorPago = new EventEmitter<void>();
  @Output() cambioMonto = new EventEmitter<number>();
  @Input() tipoDePago!: string;
  
  monto: number = 0;

  ngOnInit() {
    console.log(this.tipoDePago);
  }

  eliminarPago(){
    this.deleteSelectorPago.emit()
  }

  emitirCambioMonto(){
    this.cambioMonto.emit(this.monto);
  }

}
