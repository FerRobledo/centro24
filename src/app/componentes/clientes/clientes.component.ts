import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { AgregarPagoModalComponent } from './agregarPagoModal/agregarPagoModal.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientsOfMonth: any[] = [];
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  payThisMonth: { [id: number]: any } = {};
  isLoading: Boolean = true;

  constructor(
    private clientesService: ClientesService,
    private authService: AuthService,
    public dialog: MatDialog,
  ) { };

  ngOnInit() {
    this.loadClientsMonthly();
  }

  loadClientsMonthly() {
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

  agregarCliente(){

  }

  agregarPago() {
    const dialogRef = this.dialog.open(AgregarPagoModalComponent, {
      maxWidth: '100%',
      data: this.clientsOfMonth,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.evento) {
        this.loadClientsMonthly();
      }
    });
  }
}
