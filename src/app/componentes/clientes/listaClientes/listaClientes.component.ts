import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { InsertarClienteComponent } from '../insertarCliente/insertarCliente.component';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AgregarPagoModalComponent } from '../agregarPagoModal/agregarPagoModal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FiltroClientesPipe } from 'src/app/pipes/filtro-clientes.pipe';

@Component({
  selector: 'app-listaClientes',
  standalone: true,
  imports: [ RouterModule, FormsModule, ReactiveFormsModule, MatDividerModule, CommonModule, FiltroClientesPipe ],
  templateUrl: './listaClientes.component.html'
})
export class ListaClientesComponent implements OnInit, OnDestroy {
  private dialogRef: MatDialogRef<any> | null = null;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private authService: AuthService,
    public clientesService: ClientesService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.loadClientsMonthly();
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  clientsOfMonth: any[] = [];
  clicked: Boolean = false;
  clientEdit: any = null;
  eliminandoClienteId: number | null = null;
  filtroClients: string = '';
  porcentaje: number = 0; // enlazado al input
  isLoading: boolean = true;

  loadClientsMonthly() {
    const idAdmin = this.authService.getIdAdmin();
    if (!idAdmin) {
      this.clientsOfMonth = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.clientesService.getClientsOfMonth(idAdmin).subscribe({
      next: (data) => {
        this.clientsOfMonth = data;
        //this.clientsOfMonth = data.sort((a, b) => a.id - b.id);  
        //agarra dos elements y pregunta si el A es menor a B va a dar negativo y lo deja asi
        //si es positivo quiere decir que A es mas grande que B y lo intercambia de lugar
      },
      error: (error) => {
        console.error("Error en el pedido de clientes del día: ", error);
        this.clientsOfMonth = [];
      },
      complete: () => {
        this.isLoading = false;
        this.mapearClientes();
      }
    })
  }

  public updateClient(client: any) {
    const dialogRef = this.dialog.open(InsertarClienteComponent, {
      maxWidth: '100%',
      data: { client, accion: "editar" },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'submit') {
        this.loadClientsMonthly();
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
        this.loadClientsMonthly();
      }
      this.dialogRef = null;
    });
  }

  public deleteClient(client: any) {
    this.eliminandoClienteId = client.id_client;
    const idClient = client.id_client;
    const idAdmin = this.authService.getIdAdmin();

    console.log("que id es? :" + idClient);
    
    if (idAdmin) {
      this.clientesService.deleteClient(idAdmin, idClient).subscribe({
        next: () => {
          ;
          this.eliminandoClienteId = null;
          this.loadClientsMonthly();

        },
        error: (error) => {
          ;
          this.eliminandoClienteId = null;
          console.log("Error en la eliminacion del cliente: ", error)
        },
      })
    }
  }

  openDeleteConfirm(client: any) {
    let titulo = 'Confirmar borrado';
    let mensaje = '';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: titulo,
        message: mensaje
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteClient(client);
      }
    })
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
        if (idAdmin && this.porcentaje !== null) {
          this.subscriptions.add(
            this.clientesService.incrementClient(idAdmin, this.porcentaje).subscribe({
              error: (error) => {
                console.error(error);
              },
              complete: () => {
                this.loadClientsMonthly();
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

  mapearMontos() {
    this.clientsOfMonth = this.clientsOfMonth.map(client => {
      let monto = 0;
      monto = client.monto;

      return {
        ...client,
        monto: monto,
      }
    })
  }

  mapearMesesClientes() {
    const hoy = new Date;
    this.clientsOfMonth = this.clientsOfMonth.map(client => {

      let pagos = client.pagos;
      pagos.sort((a: any, b: any) => new Date(a.periodo_hasta).getTime() - new Date(b.periodo_hasta).getTime());
      const ultimoPago = pagos[pagos.length - 1];
      let mesesVigente = 0;
      let periodoHasta: { anio: number, mes: number } = { anio: 0, mes: 0 };
      // Si tiene pagos hacer el calculo de cuantos meses le quedan
      if (ultimoPago) {
        const [anio, mes] = ultimoPago.periodo_hasta.split('-').map(Number);
        periodoHasta = { anio, mes };
        mesesVigente = this.calcularMesesDiferencia(hoy, periodoHasta);
      }

      return {
        ...client,
        monto: Number(client.monto),
        mesesVigente: mesesVigente,
        periodoHasta: periodoHasta,
      }
    });
  }

  getPeriodoHasta(client: any): Date {
    return new Date(client.periodoHasta.anio, client.periodoHasta.mes - 1, 1);
  }
  
  calcularMesesDiferencia(desde: Date, hasta: { anio: number, mes: number }): number {
    const yearDiff = hasta.anio - desde.getFullYear();
    const monthDiff = hasta.mes - (desde.getMonth() + 1);
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
        this.loadClientsMonthly();
      }
    });
  }

  isAdmin() {
    return this.authService.esAdmin();
  }
}
