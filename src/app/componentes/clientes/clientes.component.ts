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
  porcentaje: number | null = null; // enlazado al input
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

  

  agregarPago() {
    this.dialogRef = this.dialog.open(AgregarPagoModalComponent, {
      maxWidth: '100%',
      data: this.clientsOfMonth,
      disableClose: false,
      autoFocus: true,
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
      if (result?.evento == 'pagoCreado') {
        this.resetComponent();
      }
    });
  }
  
  private resetComponent() {
    this.clientsOfMonth = [];
    this.payThisMonth = {};
    this.loadClientsMonthly();
  }

  detectChanges() {
    this.cdr.detectChanges();
  }

  abrirConfirmacion() {
    let titulo = 'Confirmar incremento';
    let mensaje = '';
  
    if (!this.porcentaje || isNaN(this.porcentaje)) {
      titulo = 'Atención';
      mensaje = 'Por favor, ingrese un porcentaje válido antes de continuar.';
    } else {
      mensaje = `¿Seguro que querés aplicar un incremento del ${this.porcentaje}%?`;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: titulo,
        message: mensaje
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        const idAdmin = this.authService.getIdAdmin();
        this.cdr.detectChanges();
      
        if (idAdmin && this.porcentaje !== null) {
          this.subscriptions.add(
            this.clientesService.incrementClient(idAdmin, this.porcentaje).subscribe({
              next: (data) => {
                console.log(data);
                this.cdr.detectChanges();
                this.loadClientsMonthly();
              },
              error: (error) => {
                console.error(error);
                this.cdr.detectChanges();
                this.loadClientsMonthly();
              },
              complete: () => {
                this.cdr.detectChanges();
                this.loadClientsMonthly();
              }
            })
          );
        }
      }      
    });
  }
}