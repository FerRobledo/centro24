import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-listaPagos',
  templateUrl: './listaPagos.component.html',
  styleUrls: ['./listaPagos.component.css']
})
export class ListaPagosComponent implements OnInit {

  constructor() { }
  @Input() clientes: any = [];
  listaPagos: any[] = [];

  ngOnInit() {
    console.log(this.listaPagos);
    this.generarListaPagos();
  }

  generarListaPagos() {
    this.clientes.forEach((cliente: any) => {
      cliente.pagos.forEach((pago: any) => {
        pago = {...pago, cliente: cliente.cliente}
        this.listaPagos.push(pago);
      });
    });
    console.log(this.listaPagos);
  }
}
