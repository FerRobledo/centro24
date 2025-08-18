import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
import { RegisterClienteComponent } from 'src/app/componentes/cobranza/registerCliente/registerCliente.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HistorialClientsComponent } from '../historial-clients/historial-clients.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza.component.html',
  styleUrls: ['./cobranza.component.css']
})
export class CobranzaComponent implements OnInit, OnDestroy {
  public clientEdit: any = null;
  clientsOfDay: any[] = [];
  historyCierres: any = [];
  collectionDay = -1;
  today: Date = new Date();
  isLoadingCobranza: boolean = false;
  dialogRef: MatDialogRef<any> | null = null;
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

  public closeDay() {
    const id = this.authService.getIdAdmin();
    const nameUser = this.authService.getUserName();
    console.log('nombre del user ' + nameUser);

    if (id) {
      this.subscriptions.add(
        this.cobranzaService.closeClientsOfDay(id, nameUser).subscribe({
          next: (data) => {
            this.collectionDay = data.total;
            if (data === 0) {
              this.collectionDay = 0;
            }
            ; //revisá este componente ya mismo por si hay algo que cambió y actualizá el HTML.
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
    ; // Fuerza el spinner a mostrarse

    if (id) {
      this.subscriptions.add(
        this.cobranzaService.getClientsOfDay(id).subscribe({
          next: (data) => {
            console.log("Datos recargados en Cobranza:", data);
            this.clientsOfDay = data;
            this.isLoadingCobranza = false;
            ;
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

  nuevaCobranza() {
    this.dialogRef = this.dialog.open(RegisterClienteComponent, {
      maxWidth: '100%',
      disableClose: false,
      autoFocus: true,
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

    this.isLoadingCobranza = true;
    ;
    
    this.subscriptions.add(
      this.cobranzaService.getHistory(id).subscribe({
        next: (data) => {
          this.historyCierres = data ?? [];
          this.isLoadingCobranza = false;
          ;
          
          // abro modal con datos cargados
          this.dialogRef = this.dialog.open(HistorialClientsComponent, {
            width: '47vw',
            maxWidth: '100vw',
            data: this.historyCierres,
            disableClose: false,
            autoFocus: true,
          });
          
          this.dialogRef.afterClosed().subscribe(() => {
            this.dialogRef = null;
          });
        },
        error: (error) => {
          this.isLoadingCobranza = false;
          ;
        }
      })
    );
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

  openDeleteConfirm(client: any){ 
    console.log('Abriendo modal para:', client);
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
}