import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { InsertarClienteComponent } from '../insertarCliente/insertarCliente.component';

@Component({
  selector: 'app-listaClientes',
  templateUrl: './listaClientes.component.html',
  styleUrls: ['./listaClientes.component.css']
})
export class ListaClientesComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private clientesService: ClientesService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
  }

  @Output() loadClientsMonthly = new EventEmitter<void>();
  @Input() clientsOfMonth: any[] = [];
  clicked: Boolean = false;
  clientEdit: any = null;

  public updateClient(client: any) {
    const dialogRef = this.dialog.open(InsertarClienteComponent, {
      maxWidth: '100%',
      data: {client, accion:"editar"},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'submit'){
        this.loadClientsMonthly;
      }
    });
  }

  public deleteClient(client: any) {
    const idClient = client.id_client;
    const idAdmin = this.authService.getIdAdmin();
    if (idAdmin) {
      this.clientesService.deleteClient(idAdmin, idClient).subscribe({
        next: (data) => {
          const resp = data as { success: boolean; deletedId: number }; //se hace en dos pasos pq typescript no confia como devuelvan el objeto data
          console.log("El id del cliente eliminado es: ", resp.deletedId); //no permite data.atributo
          this.loadClientsMonthly;
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
}
