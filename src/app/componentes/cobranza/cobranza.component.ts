import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
import { RegisterClienteComponent } from 'src/app/componentes/cobranza/registerCliente/registerCliente.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HistorialClientsComponent } from '../historial-clients/historial-clients.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cobranza',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cobranza.component.html',
})
export class CobranzaComponent implements OnInit, OnDestroy {
  public clientEdit: any = null;
  clientsOfDay: any[] = [];
  historyCierres: any = [];
  collectionDay = -1;
  today: Date = new Date();
  isLoadingCobranza: boolean = false;
  dialogRef: MatDialogRef<any> | null = null;
  dialogRef2!: MatDialogRef<HistorialClientsComponent>;


  // Variables modal cierre de caja
  mostrarModalCierre = false;
  successMessage = false;



  selectedDate: string = '';
  private subscriptions: Subscription = new Subscription();
  dias: number[] = [];
  anios: number[] = [];
  meses: any = []

  constructor(
    private cobranzaService: CobranzaService,
    private authService: AuthService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef //inyecta ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadClientsDaily();
  }

  ngOnDestroy() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    this.dialog.closeAll();
    this.subscriptions.unsubscribe(); //limpia todas las suscripciones
  }

  closeDay() {
    const id = this.authService.getIdAdmin();
    const nameUser = this.authService.getUserName();

    if (id) {
      this.subscriptions.add(
        this.cobranzaService.cerrarCaja(id, nameUser).subscribe({
          next: (data) => {
            console.log(data)
            this.collectionDay = data.total;
            this.mostrarMensajeExito();
          },
          error: (error) => {
            console.log("Error en el calculo de recaudacion: ", error);
          },
        })
      );
    }
  }

  public loadClientsDaily() {
    const id = this.authService.getIdAdmin();
    this.isLoadingCobranza = true;
    // Fuerza el spinner a mostrarse

    if (id) {
      this.subscriptions.add(
        this.cobranzaService.getClientsOfDay(id).subscribe({
          next: (data) => {
            this.clientsOfDay = data;
            this.clientsOfDay = this.clientsOfDay.map(client => {
              return {
                ...client,
                fecha: client.fecha.replace('T', ' ').replace('Z', '')
              };
            });
            //this.ngOnInit();
            this.isLoadingCobranza = false;
          },
          error: (error) => {
            console.log("Error en el pedido de clientes del dia: ", error);
            this.isLoadingCobranza = false;
            ;
          },
        })
      );
    } else {
      this.clientsOfDay = [];
      this.isLoadingCobranza = false;
      ;
    }
  }

  isAdmin() {
    return this.authService.esAdmin();
  }

  public updateClient(client: any) {

    const dialogRef = this.dialog.open(RegisterClienteComponent, {
      maxWidth: '100%',
      data: { client, accion: "editar" },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'submit') {
        this.loadClientsDaily();
      }
    });
  }

  public deleteClient(client: any) {
    const idClient = client.id;
    const idAdmin = this.authService.getIdAdmin();
    if (idAdmin) {
      this.subscriptions.add(
        this.cobranzaService.deleteClient(idAdmin, idClient).subscribe({
          next: () => {
            this.loadClientsDaily();
            ;
          },
          error: (error) => {
            console.log("Error en la eliminacion del cliente: ", error);
          },
        })
      );
    }
  }

  nuevaCobranza(accion: string, data: any = null) {
    this.dialogRef = this.dialog.open(RegisterClienteComponent, {
      maxWidth: '100%',
      disableClose: false,
      autoFocus: true,
      data: { accion, data },
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
      if (result == 'submit') {
        this.resetComponent();
        this.loadClientsDaily();
      }
    });

  }

  private resetComponent() {
    this.clientsOfDay = [];
    this.clientEdit = null;
    this.collectionDay = -1;
    //this.loadClientsDaily();
    ;
  }

  openHistorial() {

    const id = this.authService.getIdAdmin();
    if (!id) return;

    this.dialogRef2 = this.dialog.open(HistorialClientsComponent, {
      width: '47vw',
      maxWidth: '100vw',
      data: {},
      disableClose: false,
      autoFocus: true,
    });

    this.dialogRef2.componentInstance.isLoading = true;

    this.dialogRef2.afterClosed().subscribe(() => {
      this.dialogRef2 = null!;
    });

    this.subscriptions.add(
      this.cobranzaService.getHistory(id).subscribe({
        next: (data) => {

          this.historyCierres = data ?? [];

          this.dialogRef2.componentInstance.isLoading = false;
          this.dialogRef2.componentInstance.historial = data;
        },
        error: (error) => {
          console.error(error);
        },
      })
    );

  }

  openModalCloseDay() {
    this.mostrarModalCierre = true;
  }

  getTotal(cliente: any): number {
    let suma = 0;
    suma += Number(cliente.efectivo);
    suma += Number(cliente.debito);
    suma += Number(cliente.credito);
    suma += Number(cliente.transferencia);
    suma += Number(cliente.cheque);
    suma -= Number(cliente.gasto);
    return suma;
  }

  fitrarFecha() {
    this.isLoadingCobranza = true;
    if (this.selectedDate == '') {
      this.loadClientsDaily();
    }

    const idAdmin = this.authService.getIdAdmin();
    this.subscriptions.add(
      this.cobranzaService.getClientsByDate(idAdmin, this.selectedDate).subscribe({
        next: (data) => {
          this.clientsOfDay = data;
        },
        error: (error) => {
          console.log("Error en el pedido de clientes del dia: ", error);
        },
        complete: () => {
          this.isLoadingCobranza = false;
        }
      })
    )
      ;
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

  cerrarModalCierre() {
    this.mostrarModalCierre = false;
  }

  mostrarMensajeExito() {
    this.successMessage = true;
    setTimeout(() => {
      this.successMessage = false;
    }, 1000);
  }
}