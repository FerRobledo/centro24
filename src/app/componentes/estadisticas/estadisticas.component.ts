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
  cantUsersByAdmin:number = 0;
  collectionYesterday:number = 0;
  isLoading:Boolean = true;

  constructor(private estadisticasService: EstadisticasService, private authService: AuthService) { }

  ngOnInit() {
    this.loadPreviousMonth();
    this.loadCurrentMonth();
    this.loadClients();
    this.loadNewClients();
    this.loadCantUsersByAdmin();
    this.collectionOfYesterday();
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
          console.log("Error en el pedido de la recaudacion del mes anterior: ", error);
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
          console.log("Error en el pedido de recaudacion del mes: ", error);
          
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
          console.log("Error en el pedido del total de clientes: ", error);
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
          console.log("Error en el pedido de nuevos clientes del mes: ", error);
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }

  loadCantUsersByAdmin(){
    const id =this.authService.getIdAdmin();
    if(id){
      this.estadisticasService.getUsersByAdmin(id).subscribe({
        next: (data) => {
          this.cantUsersByAdmin = data;
          console.log("El total de usuarios de este admin es de: ", data);
        },
        error: (error) => {
          console.log("Error en el pedido de users: ", error);
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }

  collectionOfYesterday(){ //preloader en la ultima card asi epsero que carguen todos
    const id= this.authService.getIdAdmin();
    this.isLoading = true;
    if(id) {
      this.estadisticasService.getCollectionYesterday(id).subscribe({
        next: (data) => {
          this.collectionYesterday = data;
          this.isLoading = false;
          console.log("El total de usuarios de este admin es de: ", data);
        },
        error: (error) => {
          this.isLoading = false;
          console.log("Error en el pedido de users: ", error);
        },
        complete: () => {
          this.isLoading = false;
          console.log("Pedido en estado OK");
        }
      })
    }
  }
}
