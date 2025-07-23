import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { AgregarPagoModalComponent } from './agregarPagoModal/agregarPagoModal.component';
import { InsertarClienteComponent } from './insertarCliente/insertarCliente.component';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ConfirmarDeleteComponent } from '../productos/confirmar-delete/confirmar-delete.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit, OnDestroy {
  clientsOfMonth: any[] = [];
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  payThisMonth: { [id: number]: any } = {};
  isLoading: boolean = false;
  private dialogRef: MatDialogRef<any> | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public clientesService: ClientesService,
    private authService: AuthService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef // inyecto ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadClientsMonthly();
  }

  ngOnDestroy(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    this.dialog.closeAll();
    this.subscriptions.unsubscribe();
  }

  loadClientsMonthly() {
    const idAdmin = this.authService.getIdAdmin();
    if (!idAdmin) {
      this.clientsOfMonth = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // para mostrar loader inmediatamente

    this.subscriptions.add(
      this.clientesService.getClientsOfMonth(idAdmin).subscribe({
        next: (data) => {
          console.log("Datos recargados en Clientes:", data);
          this.clientsOfMonth = data;
        },
        error: (error) => {
          console.error("Error en el pedido de clientes del día: ", error);
          this.clientsOfMonth = [];
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges(); // actualiza UI al terminar o error
        }
      })
    );
  }
  
  detectChanges() {
    this.cdr.detectChanges();
  }

  
}