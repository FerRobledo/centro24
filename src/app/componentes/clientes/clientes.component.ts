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
  payThisMonth: { [id: number]: any } = {};
  isLoading: Boolean = true;
  clicked: Boolean = false;
  clientEdit: any = null;

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

  private loadClientsMonthly() {
    const idAdmin = this.authService.getIdAdmin();
    this.isLoading = true;
    if (idAdmin) {
      this.clientesService.getClientsOfMonth(idAdmin).subscribe({
        next: (data) => {
          //si hay data entonces hago un .add
          this.clientsOfMonth = data;
          this.isLoading = false;
          console.log("Los clientes son: ", data);
        },
        error: (error) => {
          this.isLoading = false;
          console.log("Error en el pedido de clientes del dia: ", error)
        },
        complete: () => {
          this.isLoading = false;
          console.log("Pedido en estado OK");
        }
      })
    }
  }

  public updateClient(client: any) {
    this.clientEdit = client;
    this.clicked = true;
  }

  public deleteClient(client: any) {
    const idClient = client.id_client;
    const idAdmin = this.authService.getIdAdmin();
    if (idAdmin) {
      this.clientesService.deleteClient(idAdmin, idClient).subscribe({
        next: (data) => {
          const resp = data as { success: boolean; deletedId: number }; //se hace en dos pasos pq typescript no confia como devuelvan el objeto data
          console.log("El id del cliente eliminado es: ", resp.deletedId); //no permite data.atributo
          this.loadClientsMonthly();
        },
        error: (error) => {
          console.log("Error en la eliminacion del cliente: ", error)
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }

  getMonthsClients() {
    this.clientesService.getMontOfCurrentClient(this.monthSelected).subscribe({
      next: (data: any[]) => {
        this.payThisMonth = {};

        data.forEach((cliente) => {
          const id = cliente.id_cliente;
          this.payThisMonth[id] = cliente;
        });
          
        console.log("Clientes con pago del mes:", this.payThisMonth);
      },
      error: (error) => {
        console.error("Error al obtener clientes del mes:", error);
      },
      complete: () => {
        console.log("Consulta completada.");
      }
    });
  }
}
