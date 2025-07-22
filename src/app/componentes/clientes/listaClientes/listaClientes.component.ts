import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { InsertarClienteComponent } from '../insertarCliente/insertarCliente.component';

@Component({
  selector: 'app-listaClientes',
  templateUrl: './listaClientes.component.html',
  styleUrls: ['./listaClientes.component.css']
})
export class ListaClientesComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    public clientesService: ClientesService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.clientsOfMonth = this.clientsOfMonth.map(client => {
      const pagos = client.pagos || [];
      if (pagos.length > 0) {
        const pagosOrdenados = pagos.sort((a: { periodo_hasta: string | number | Date; }, b: { periodo_hasta: string | number | Date; }) =>
          new Date(b.periodo_hasta).getTime() - new Date(a.periodo_hasta).getTime()
        );
        const ultimoPago = new Date(pagosOrdenados[0].periodo_hasta);
        const hoy = new Date();

        const mesesActivos = this.calcularMesesDiferencia(hoy, ultimoPago);

        return {
          ...client,
          mesesActivos: mesesActivos,
          periodoHasta: ultimoPago
        };
      }

      return {
        ...client,
        mesesActivos: 0,
        periodoHasta: null
      };
    });
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  @Output() loadClientsMonthly = new EventEmitter<void>();
  @Input() clientsOfMonth: any[] = [];
  clicked: Boolean = false;
  clientEdit: any = null;
  eliminandoClienteId: number | null = null;

  public updateClient(client: any) {
    const dialogRef = this.dialog.open(InsertarClienteComponent, {
      maxWidth: '100%',
      data: { client, accion: "editar" },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'submit') {
        this.loadClientsMonthly.emit();
      }
    });
  }

  public deleteClient(client: any) {
    this.eliminandoClienteId = client.id_client;
    const idClient = client.id_client;
    const idAdmin = this.authService.getIdAdmin();
    if (idAdmin) {
      this.clientesService.deleteClient(idAdmin, idClient).subscribe({
        next: () => {
          this.eliminandoClienteId = null;
          this.loadClientsMonthly.emit();
        },
        error: (error) => {
          this.eliminandoClienteId = null;
          console.log("Error en la eliminacion del cliente: ", error)
        },
      })
    }
  }
  
  calcularMesesDiferencia(desde: Date, hasta: Date): number {
    const anios = hasta.getFullYear() - desde.getFullYear();
    const meses = hasta.getMonth() - desde.getMonth();
    const total = anios * 12 + meses;
    return total >= 0 ? total + 1 : 0;
  }
}
