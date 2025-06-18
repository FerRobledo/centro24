import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza.component.html',
  styleUrls: ['./cobranza.component.css']
})
export class CobranzaComponent implements OnInit {
  clientsOfDay: any[] = [];
  clicked = false;
  collectionDay = 0;
  collectionClosed = false;
  today: Date = new Date();

  constructor(private cobranzaService: CobranzaService, private authService: AuthService) {
    console.log('Componente init');
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

}
