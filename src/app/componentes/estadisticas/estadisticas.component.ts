import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { EstadisticasService } from 'src/app/services/estadisticas.service';


@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  collectionPreviousMonth:number = 0;
  collectionCurrentMonth:number = 0;
  cantClients:number = 0;
  newClients:number = 0;
  //demas stats de las cards

  constructor(private estadisticasService: EstadisticasService, private authService: AuthService) { }

  ngOnInit() {
    this.loadPreviousMonth();
    this.loadCurrentMonth();
    this.loadClients();
    this.loadNewClients();
  }

  loadPreviousMonth() {
    const id = this.authService.getIdAdmin();

    if (id) {
      this.estadisticasService.getStatsPreviousMonth(id).subscribe({
        next: (data) => {
          this.collectionPreviousMonth = data;
          console.log("El total recaudado del mes anterior es de: ", data);
        },
        error: (error) => {
          console.log("Error en el pedido de clientes del dia: ", error);
          
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }

  loadCurrentMonth() {
    const id = this.authService.getIdAdmin();
    if(id) {
      this.estadisticasService.getStatsCurrenMonth(id).subscribe({
        next: (data) => {
          this.collectionCurrentMonth = data;
          console.log("El total recaudado del mes actual es de: ", data);
        },
        error: (error) => {
          console.log("Error en el pedido de clientes del dia: ", error);
          
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }

  loadClients() {
    const id = this.authService.getIdAdmin();
    if(id) {
      this.estadisticasService.getClients(id).subscribe({
        next: (data) => {
          this.cantClients = data;
          console.log("El total de clientes es: ", data);
        },
        error: (error) => {
          console.log("Error en el pedido de clientes del dia: ", error);
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }

  loadNewClients(){
    const id = this.authService.getIdAdmin();
    if(id) {
      this.estadisticasService.getNewClients(id).subscribe({
        next: (data) => {
          this.newClients = data;
          console.log("El total de nuevos clientes es: ", data);
        },
        error: (error) => {
          console.log("Error en el pedido de clientes del dia: ", error);
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }
}
