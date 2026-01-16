import { Component, OnInit } from '@angular/core';
import { AgregarPagoModalComponent } from '../agregarPagoModal/agregarPagoModal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoMensualService } from 'src/app/services/pagoMensual.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-listaPagos',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, MatPaginatorModule],
  templateUrl: './listaPagos.component.html'
})
export class ListaPagosComponent implements OnInit {
  private dialogRef: MatDialogRef<any> | null = null;
  constructor(
    private pagoMensualService: PagoMensualService,
    public dialog: MatDialog,
  ) { }

  pagos: any[] = [];
  eliminandoPagoId: number | null = null; // guarda el id del pago que está siendo eliminado
  filtroPago: string = '';
  isLoading: boolean = true;


  // FILTRO Y PAGINADO
  page = 1;
  pageSize = 10;
  total = 0;
  search = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.pagos = [];
    this.isLoading = true;

    this.pagoMensualService.getPagosMensuales({ page: this.page, pageSize: this.pageSize, search: this.search }).subscribe({
      next: (data) => {
        this.pagos = data.pagos;
        this.total = data.total;
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
    this.isLoading = true;

    this.pagoMensualService.deletePago(id).subscribe({
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

  onSearchChange() {
    this.loadData();
  }

  setPageSize(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.loadData();
  }

  handlePageEvent(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.loadData();
  }
}
