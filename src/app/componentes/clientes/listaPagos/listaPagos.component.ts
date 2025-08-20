import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { AgregarPagoModalComponent } from '../agregarPagoModal/agregarPagoModal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-listaPagos',
  templateUrl: './listaPagos.component.html',
  styleUrls: ['./listaPagos.component.css']
})
export class ListaPagosComponent implements OnInit {
  private dialogRef: MatDialogRef<any> | null = null;
  constructor(
    private clienteService: ClientesService,
    public dialog: MatDialog,
    private authService: AuthService,
  ) { }

  @Input() clientes: any = [];
  listaPagos: any[] = [];
  @Output() loadClientsMonthly = new EventEmitter<void>();
  eliminandoPagoId: number | null = null; // guarda el id del pago que está siendo eliminado
  filtroPago: string = '';
  isLoading: boolean = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const idAdmin = this.authService.getIdAdmin();
    if (!idAdmin) {
      this.clientes = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.clienteService.getClientsOfMonth(idAdmin).subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (error) => {
        console.error("Error en el pedido de clientes del día: ", error);
        this.clientes = [];
      },
      complete: () => {
        this.isLoading = false;
        this.generarListaPagos();
      }
    })
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

  agregarPago() {
    this.dialogRef = this.dialog.open(AgregarPagoModalComponent, {
      maxWidth: '100%',
      data: { clients: this.clientes },
      disableClose: false,
      autoFocus: true,
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
      if (result?.evento == 'pagoCreado') {
        this.loadClientsMonthly.emit();
      }
    });
  }
}
