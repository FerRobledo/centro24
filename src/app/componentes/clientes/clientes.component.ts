import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { AgregarPagoModalComponent } from './agregarPagoModal/agregarPagoModal.component';
import { InsertarClienteComponent } from './insertarCliente/insertarCliente.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit, OnDestroy {
  clientsOfMonth: any[] = [];
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  payThisMonth: { [id: number]: any } = {};
  isLoading: Boolean = true;

  constructor(
    public clientesService: ClientesService,
    private authService: AuthService,
    public dialog: MatDialog,
  ) {
    console.log("clientes component")
  };

  ngOnInit() {
    this.loadClientsMonthly();
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  loadClientsMonthly() {
    const idAdmin = this.authService.getIdAdmin();
    this.isLoading = true;
    if (idAdmin) {
      this.clientesService.getClientsOfMonth(idAdmin).subscribe({
        next: (data) => {
          //si hay data entonces hago un .add
          this.clientsOfMonth = data;
        },
        error: (error) => {
          this.isLoading = false;
          console.log("Error en el pedido de clientes del dia: ", error)
        },
        complete: () => {
          this.isLoading = false;
        }
      })
    }
  }

  agregarCliente() {
    const dialogRef = this.dialog.open(InsertarClienteComponent, {
      maxWidth: '100%',
      data: { accion: "agregar" },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'submit') {
        this.loadClientsMonthly();
      }
    });
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

  soloLetras(event: KeyboardEvent): void { //cuando escucha el teclado, solo te deja escribir letras
    const pattern = /[a-zA-Z\s]/;
    const inputChar = String.fromCharCode(event.keyCode || event.which);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
