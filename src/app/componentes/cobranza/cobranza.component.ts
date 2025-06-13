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
  //client

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
    this.insertClientDaily();
  }

  private loadClientsDaily() {
    const id = this.authService.getUserId();
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

  private insertClientDaily() {
    console.log("entre");
    
    const id = this.authService.getUserId();
    if (id) {
      this.cobranzaService.postClientDaily(id).subscribe({

        next: (data) => {
          //this.client = data;
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
