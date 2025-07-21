import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
import { RegisterClienteComponent } from 'src/app/componentes/cobranza/registerCliente/registerCliente.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza.component.html',
  styleUrls: ['./cobranza.component.css']
})
export class CobranzaComponent implements OnInit, OnDestroy {
  public clientEdit: any = null;
  clientsOfDay: any[] = [];
  collectionDay = -1;
  today: Date = new Date();
  isLoadingCobranza: boolean = false;
  private dialogRef: MatDialogRef<RegisterClienteComponent> | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private cobranzaService: CobranzaService,
    private authService: AuthService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef //inyecta ChangeDetectorRef
  ) {
    console.log("cobranza component initialized");
  }

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
    if (id) {
      this.subscriptions.add(
        this.cobranzaService.closeClientsOfDay(id).subscribe({
          next: (data) => {
            this.collectionDay = data.total;
            this.cdr.detectChanges(); //revisá este componente ya mismo por si hay algo que cambió y actualizá el HTML.
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
    this.cdr.detectChanges(); // Fuerza el spinner a mostrarse

    if (id) {
      this.subscriptions.add(
        this.cobranzaService.getClientsOfDay(id).subscribe({
          next: (data) => {
            console.log("Datos recargados en Cobranza:", data);
            this.clientsOfDay = data;
            this.isLoadingCobranza = false;
            this.cdr.detectChanges(); 
          },
          error: (error) => {
            console.log("Error en el pedido de clientes del dia: ", error);
            this.isLoadingCobranza = false;
            this.cdr.detectChanges(); 
          },
        })
      );
    } else {
      this.clientsOfDay = [];
      this.isLoadingCobranza = false;
      this.cdr.detectChanges();
    }
  }

  public updateClient(client: any) {
    this.clientEdit = client;
  }

  public deleteClient(client: any) {
    const idClient = client.id;
    const idAdmin = this.authService.getIdAdmin();
    if (idAdmin) {
      this.subscriptions.add(
        this.cobranzaService.deleteClient(idAdmin, idClient).subscribe({
          next: () => {
            this.loadClientsDaily();
            this.cdr.detectChanges(); 
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
      if(result == 'submit'){
        this.resetComponent();
      }
    });
  }

  private resetComponent() {
    this.clientsOfDay = [];
    this.clientEdit = null;
    this.collectionDay = -1;
    this.loadClientsDaily();
    this.cdr.detectChanges(); 
  }
}