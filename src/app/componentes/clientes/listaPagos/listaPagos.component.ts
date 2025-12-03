import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AgregarPagoModalComponent } from '../agregarPagoModal/agregarPagoModal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FiltroClientesPipe } from 'src/app/pipes/filtro-clientes.pipe';
import { PagoMensualService } from 'src/app/services/pagoMensual.service';

@Component({
  selector: 'app-listaPagos',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, FiltroClientesPipe],
  templateUrl: './listaPagos.component.html'
})
export class ListaPagosComponent implements OnInit {
  private dialogRef: MatDialogRef<any> | null = null;
  constructor(
    private pagoMensualService: PagoMensualService,
    public dialog: MatDialog,
    private authService: AuthService,
  ) { }

  pagos: any[] = [];
  eliminandoPagoId: number | null = null; // guarda el id del pago que está siendo eliminado
  filtroPago: string = '';
  isLoading: boolean = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const idAdmin = this.authService.getIdAdmin();
    this.pagos = [];
    this.isLoading = true;
    if (!idAdmin) {
      this.isLoading = false;
      return;
    }

    this.pagoMensualService.getPagosMensuales(idAdmin).subscribe({
      next: (data) => {
        this.pagos = data;
        console.log(data);
      },
      error: (error) => {
        console.error("Error en el pedido de clientes del día: ", error);
        this.pagos = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }


  deletePago(id: number) {
    const idAdmin = this.authService.getIdAdmin();
    this.isLoading = true;
    if (!idAdmin) {
      this.isLoading = false;
      return;
    }

    this.pagoMensualService.deletePago(idAdmin, id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    })
  }

  agregarPago() {
    this.dialogRef = this.dialog.open(AgregarPagoModalComponent, {
      maxWidth: '100%',
      data: { clients: this.pagos },
      disableClose: false,
      autoFocus: true,
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
      if (result?.evento == 'pagoCreado') {
        this.loadData();
      }
    });
  }

  toInputDatetimeWithDay(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toInputDatetime(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
