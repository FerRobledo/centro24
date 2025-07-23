import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { InsertarClienteComponent } from '../insertarCliente/insertarCliente.component';

@Component({
  selector: 'app-listaClientes',
  templateUrl: './listaClientes.component.html',
  styleUrls: ['./listaClientes.component.css']
})
export class ListaClientesComponent implements OnInit, OnDestroy {
  private dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private authService: AuthService,
    public clientesService: ClientesService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.mapearClientes();
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  @Output() loadClientsMonthly = new EventEmitter<void>();
  @Input() clientsOfMonth: any[] = [];
  clicked: Boolean = false;
  clientEdit: any = null;
  eliminandoClienteId: number | null = null;
  filtroClients: string = '';

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

  agregarCliente() {
    this.dialogRef = this.dialog.open(InsertarClienteComponent, {
      maxWidth: '100%',
      data: { accion: "agregar" },
      disableClose: false,
      autoFocus: true,
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result == 'submit') {
        //resetear
      }
      this.dialogRef = null;
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

  mapearClientes() {
    const hoy = new Date();

    this.clientsOfMonth = this.clientsOfMonth.map(client => {
      const pagos = client.pagos || [];

      if (pagos.length > 0) {
        let totalMesesPagados = 0;

        let ultimoPeriodoHasta = new Date(pagos[0].periodo_hasta);

        for (const pago of pagos) {
          const desde = new Date(pago.periodo_desde);
          const hasta = new Date(pago.periodo_hasta);

          totalMesesPagados += this.calcularMesesDiferencia(desde, hasta);

          // Actualizar último periodo_hasta si es más reciente
          if (hasta > ultimoPeriodoHasta) {
            ultimoPeriodoHasta = hasta;
          }
        }

        // Calcular mes siguiente al último periodo_hasta para calcular deuda
        const mesSiguienteAlUltimoPago = new Date(ultimoPeriodoHasta);
        mesSiguienteAlUltimoPago.setMonth(mesSiguienteAlUltimoPago.getMonth() + 1);

        // Calcular meses adeudados desde mes siguiente al último pago hasta hoy
        const mesesAdeudados = this.calcularMesesDiferencia(mesSiguienteAlUltimoPago, hoy);

        return {
          ...client,
          mesesActivos: totalMesesPagados,
          periodoHasta: ultimoPeriodoHasta,
          mesesAdeudados
        };
      } else {
        // No tiene pagos, deuda desde fecha alta hasta hoy
        const fechaAlta = new Date(client.fecha);
        const mesesAdeudados = this.calcularMesesDiferencia(fechaAlta, hoy);

        return {
          ...client,
          mesesActivos: 0,
          periodoHasta: null,
          mesesAdeudados
        };
      }
    });
  }


  calcularMesesDiferencia(desde: Date, hasta: Date): number {
    const anios = hasta.getFullYear() - desde.getFullYear();
    const meses = hasta.getMonth() - desde.getMonth();
    const totalMeses = anios * 12 + meses + 1; // +1 para incluir ambos meses
    return totalMeses > 0 ? totalMeses : 0;
  }



  agregarPago(client: any) { };
}
