import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { InsertarClienteComponent } from '../insertarCliente/insertarCliente.component';

@Component({
  selector: 'app-listaClientes',
  templateUrl: './listaClientes.component.html',
  styleUrls: ['./listaClientes.component.css']
})
export class ListaClientesComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    public clientesService: ClientesService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }
  @Output() loadClientsMonthly = new EventEmitter<void>();
  @Input() clientsOfMonth: any[] = [];
  clicked: Boolean = false;
  clientEdit: any = null;

  public updateClient(client: any) {
    const dialogRef = this.dialog.open(InsertarClienteComponent, {
      maxWidth: '100%',
      data: { client, accion: "editar" },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'submit') {
        this.loadClientsMonthly.emit();
      }
    });
  }

  public deleteClient(client: any) {
    const idClient = client.id_client;
    const idAdmin = this.authService.getIdAdmin();
    if (idAdmin) {
      this.clientesService.deleteClient(idAdmin, idClient).subscribe({
        next: () => {
          this.loadClientsMonthly.emit();
        },
        error: (error) => {
          console.log("Error en la eliminacion del cliente: ", error)
        },
      })
    }
  }
}
