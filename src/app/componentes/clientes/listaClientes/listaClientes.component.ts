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
    this.mapearMesesClientes();
    this.mapearMontos();
  }

  mapearMontos(){
    this.clientsOfMonth = this.clientsOfMonth.map(client =>{
      let monto = 0;
      if(client.tipo == "Mensual"){
        monto = client.mensual;
      } else if(client.tipo == "Semestral") {
        monto = client.mensual * 5;
      }

      return {
        ...client,
        monto: monto,
      }
    })
  }

  mapearMesesClientes() {
    const hoy = new Date;
    this.clientsOfMonth = this.clientsOfMonth.map(client => {

      const ultimoPago = client.pagos[client.pagos.length - 1];

      let mesesVigente = 0;
      let periodoHasta;

      // Si tiene pagos hacer el calculo de cuantos meses le quedan
      if (ultimoPago) {
        periodoHasta = new Date(ultimoPago.periodo_hasta);
        mesesVigente = this.calcularMesesDiferencia(hoy, periodoHasta);
      }

      console.log(mesesVigente);
      return {
        ...client,
        mesesVigente: mesesVigente,
        periodoHasta: periodoHasta,
      }
    });
  }
  calcularMesesDiferencia(desde: Date, hasta: Date): number {
    const yearDiff = hasta.getFullYear() - desde.getFullYear();
    const monthDiff = hasta.getMonth() - desde.getMonth();
    return yearDiff * 12 + monthDiff + 1;
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

  detectChanges() {
    this.cdr.detectChanges();
  }
}
