import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientsOfMonth: any[] = [];
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthSelected: string = '';
  //*ngIf="clicked" (closeForm)="clicked = false"
  clicked = false;

  constructor(private clientesService: ClientesService, private authService: AuthService) {

  }

  handleClick() {
    this.clicked = true;
  }

  ngOnInit() {
    const monthCurrent = new Date().toLocaleString('es-ES', { month: 'long' });//tomo el mes actual y lo paso a español
    this.monthSelected = monthCurrent.charAt(0).toUpperCase() + monthCurrent.slice(1); //convierto la primer letra en mayuscula, ya que en el array estan con mayuscula                                                                                      
    this.loadClientsMonthly();
    console.log(this.clientsOfMonth);
    
  }

  private loadClientsMonthly(){
    const idAdmin = this.authService.getIdAdmin(); 
    if(idAdmin){
      this.clientesService.getClientsOfMonth(idAdmin).subscribe({
        next: (data) => {
          //si hay data entonces hago un .add
          this.clientsOfMonth = data;
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
