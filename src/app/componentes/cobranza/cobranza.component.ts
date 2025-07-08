import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
import { RegisterClienteComponent } from 'src/app/componentes/cobranza/registerCliente/registerCliente.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza.component.html',
  styleUrls: ['./cobranza.component.css']
})
export class CobranzaComponent implements OnInit {
  public clientEdit: any = null;
  clientsOfDay: any[] = [];
  collectionDay = -1;
  today: Date = new Date();
  isLoadingCobranza!: Boolean;
  

  constructor(
    private cobranzaService: CobranzaService,
    private authService: AuthService,
    public dialog: MatDialog,

  ) {
    console.log("cobranza component");
  }

  ngOnInit() {
    this.isLoadingCobranza = true;
    this.clientsOfDay = [];
    this.loadClientsDaily();
  }

  public closeDay() {
    const id = this.authService.getIdAdmin();
    if (id) {
      this.cobranzaService.closeClientsOfDay(id).subscribe({
        next: (data) => {
          this.collectionDay = data.total;
        },
        error: (error) => {
          console.log("Error en el calculo de recaudacion: ", error)
        },
      })
    }
  }

  public loadClientsDaily() {
    const id = this.authService.getIdAdmin();
    this.isLoadingCobranza = true;

    if (id) {
      this.cobranzaService.getClientsOfDay(id).subscribe({
        next: (data) => {
          this.clientsOfDay = data;
          this.isLoadingCobranza = false;
        },
        error: (error) => {
          console.log("Error en el pedido de clientes del dia: ", error);
          this.isLoadingCobranza = false;
        },
      })
    }
  }

  public updateClient(client: any) {
    this.clientEdit = client;
  }

  public deleteClient(client: any) {
    const idClient = client.id;
    const idAdmin = this.authService.getIdAdmin();
    if (idAdmin) {
      this.cobranzaService.deleteClient(idAdmin, idClient).subscribe({
        next: () => {
          this.loadClientsDaily();
        },
        error: (error) => {
          console.log("Error en la eliminacion del cliente: ", error)
        },
      })
    }
  }

  nuevaCobranza() {
    const dialogRef = this.dialog.open(RegisterClienteComponent, {
      maxWidth: '100%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'submit') {
        this.loadClientsDaily();
      }
    });
  }

}

