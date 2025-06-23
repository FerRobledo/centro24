import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
import { ViewChild } from '@angular/core';
import { RegisterClienteComponent } from 'src/app/componentes/cobranza/registerCliente/registerCliente.component';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza.component.html',
  styleUrls: ['./cobranza.component.css']
})
export class CobranzaComponent implements OnInit {
  @ViewChild(RegisterClienteComponent) registerClienteComp!: RegisterClienteComponent;

  clientsOfDay: any[] = [];
  clicked = false;
  public clientEdit: any = null;
  collectionDay = 0;
  collectionClosed = false;
  today: Date = new Date();

  constructor(private cobranzaService: CobranzaService, private authService: AuthService) {
    
  }

  //desglose ngOnInit asi poder agregar mas de un metodo con la accion de ejecutar cuando carga el DOM por primera vez
  //como lo hace el ngOnInit
  ngOnInit() {
    this.loadClientsDaily();
  }

  handleClick() {
    this.clicked = true;
  }

  public closeDay(){
    this.collectionClosed = true;
    console.log("me clickeaste");
    const id = this.authService.getIdAdmin();
    if(id) {
      this.cobranzaService.closeClientsOfDay(id).subscribe({
        next: (data) => {
          this.collectionDay = data.total;
          console.log("La recaudacion del dia fue: ", this.collectionDay);
        },
        error: (error) => {
          console.log("Error en el calculo de recaudacion: ", error)
        },
        complete: () => 
          console.log("El calculo fue exitoso")
      })
    }
  }

  private loadClientsDaily() {
    const id = this.authService.getIdAdmin();

    if (id) {
      this.cobranzaService.getClientsOfDay(id).subscribe({

        next: (data) => {
          //si hay data entonces hago un .add
          this.clientsOfDay = data;
          console.log("Los clientes son: ", data);
        },
        error: (error) => {
          console.log("Error en el pedido de clientes del dia: ", error)
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }

  public updateClient(client: any) {
    this.clientEdit = client;
    this.clicked = true;
  }
}

