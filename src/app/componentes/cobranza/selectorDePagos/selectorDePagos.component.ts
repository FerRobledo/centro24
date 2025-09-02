import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-selectorDePagos',
  templateUrl: './selectorDePagos.component.html',
  styleUrls: ['./selectorDePagos.component.css']
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
