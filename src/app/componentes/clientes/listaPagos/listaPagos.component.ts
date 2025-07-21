import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-listaPagos',
  templateUrl: './listaPagos.component.html',
  styleUrls: ['./listaPagos.component.css']
})
export class ListaPagosComponent implements OnInit {

  constructor(
    private clienteService: ClientesService,
    private authService: AuthService,
  ) { }

  @Input() clientes: any = [];
  listaPagos: any[] = [];
  @Output() loadClientsMonthly = new EventEmitter<void>();
  eliminandoPagoId: number | null = null; // guarda el id del pago que está siendo eliminado

  ngOnInit() {
    this.generarListaPagos();
  }

  generarListaPagos() {
    this.clientes.forEach((cliente: any) => {
      cliente.pagos.forEach((pago: any) => {
        pago = { ...pago, cliente: cliente.cliente }
        this.listaPagos.push(pago);
      });
    });
  }

  deletePago(pago: any) {
    this.eliminandoPagoId = pago.id;
    const idAdmin = this.authService.getIdAdmin();
    this.clienteService.deletePago(idAdmin, pago).subscribe({
      next: () => {
        this.eliminandoPagoId = null;
        this.loadClientsMonthly.emit();
      },
      error: (error) => {
        console.log(error);
        this.eliminandoPagoId = null;
      },
    });
  }
}
