import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { InsertarClienteComponent } from '../insertarCliente/insertarCliente.component';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AgregarPagoModalComponent } from '../agregarPagoModal/agregarPagoModal.component';

@Component({
  selector: 'app-listaClientes',
  templateUrl: './listaClientes.component.html',
  styleUrls: ['./listaClientes.component.css']
})
export class ListaClientesComponent implements OnInit, OnDestroy {
  private dialogRef: MatDialogRef<any> | null = null;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private authService: AuthService,
    public clientesService: ClientesService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
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
  porcentaje: number | null = null; // enlazado al input


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
        this.loadClientsMonthly.emit();
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

  abrirConfirmacion() {
    let titulo = 'Confirmar incremento';
    let mensaje = '';

    if (!this.porcentaje || isNaN(this.porcentaje)) {
      titulo = 'Atención';
      mensaje = 'Por favor, ingrese un porcentaje válido antes de continuar.';
    } else {
      mensaje = `¿Seguro que querés aplicar un incremento del ${this.porcentaje}%?`;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: titulo,
        message: mensaje
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const idAdmin = this.authService.getIdAdmin();
        this.cdr.detectChanges();

        if (idAdmin && this.porcentaje !== null) {
          this.subscriptions.add(
            this.clientesService.incrementClient(idAdmin, this.porcentaje).subscribe({
              next: (data) => {
                this.cdr.detectChanges();
                this.loadClientsMonthly.emit();
              },
              error: (error) => {
                console.error(error);
                this.cdr.detectChanges();
                this.loadClientsMonthly.emit();
              },
              complete: () => {
                this.cdr.detectChanges();
                this.loadClientsMonthly.emit();
              }
            })
          );
        }
      }
    });
  }

  mapearClientes() {
    const hoy = new Date();

    this.clientsOfMonth = this.clientsOfMonth.map(client => {
      const pagos = client.pagos || [];

      if (pagos.length > 0) {
        // Ordenar pagos por fecha inicio
        const pagosOrdenados = pagos
          .map((p: { periodo_desde: string | number | Date; periodo_hasta: string | number | Date; }) => ({
            desde: new Date(p.periodo_desde),
            hasta: new Date(p.periodo_hasta)
          }))
          .sort((a: { desde: { getTime: () => number; }; }, b: { desde: { getTime: () => number; }; }) => a.desde.getTime() - b.desde.getTime());

        // Combinar periodos
        const periodosCombinados: { desde: Date; hasta: Date }[] = [];
        let periodoActual = pagosOrdenados[0];

        for (let i = 1; i < pagosOrdenados.length; i++) {
          const pago = pagosOrdenados[i];

          if (pago.desde <= periodoActual.hasta) {
            // Hay solapamiento o continuidad, extendemos periodoActual
            if (pago.hasta > periodoActual.hasta) {
              periodoActual.hasta = pago.hasta;
            }
          } else {
            // No solapan, guardamos periodoActual y comenzamos uno nuevo
            periodosCombinados.push(periodoActual);
            periodoActual = pago;
          }
        }
        // Agregar último periodo
        periodosCombinados.push(periodoActual);

        // Sumar meses de los periodos combinados
        let totalMesesPagados = 0;
        let ultimoPeriodoHasta = periodosCombinados[0].hasta;

        for (const periodo of periodosCombinados) {
          totalMesesPagados += this.calcularMesesDiferencia(periodo.desde, periodo.hasta);

          if (periodo.hasta > ultimoPeriodoHasta) {
            ultimoPeriodoHasta = periodo.hasta;
          }
        }

        // Calcular mes siguiente al último periodo para deuda
        const mesSiguienteAlUltimoPago = new Date(ultimoPeriodoHasta);
        mesSiguienteAlUltimoPago.setMonth(mesSiguienteAlUltimoPago.getMonth() + 1);

        // Calcular meses adeudados
        const mesesAdeudados = this.calcularMesesDiferencia(mesSiguienteAlUltimoPago, hoy);

        return {
          ...client,
          mesesActivos: totalMesesPagados,
          periodoHasta: ultimoPeriodoHasta,
          mesesAdeudados
        };
      } else {
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

  agregarPago(client: any) {
    this.dialogRef = this.dialog.open(AgregarPagoModalComponent, {
      maxWidth: '100%',
      data: { clients: this.clientsOfMonth, client: client },
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

  detectChanges(){
    this.cdr.detectChanges();
  }
}
