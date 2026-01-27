import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
import { RegisterClienteComponent } from 'src/app/componentes/cobranza/registerCliente/registerCliente.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HistorialClientsComponent } from './historial-clients/historial-clients.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../shared/spinner.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-cobranza',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, MatPaginatorModule],
  templateUrl: './cobranza.component.html',
})
export class CobranzaComponent implements OnInit, OnDestroy {
  public clientEdit: any = null;
  ventas: any[] = [];
  historyCierres: any = [];
  collectionDay = -1;
  loading: boolean = false;
  dialogRef: MatDialogRef<any> | null = null;
  dialogRef2!: MatDialogRef<HistorialClientsComponent>;

  // FILTRO Y PAGINADO
  page = 1;
  pageSize = 10;
  total = 0;
  search = '';
  selectedDate: string = '';

  // Variables modal cierre de caja
  mostrarModalCierre = false;
  successMessage = false;
  cargandoDatosCierre = false;
  datosCierreCaja: any = {};


  constructor(
    private cobranzaService: CobranzaService,
    private authService: AuthService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    this.dialog.closeAll();
  }

  closeDay() {
    const nameUser = this.authService.getUserName();
    this.cargandoDatosCierre = true;

    this.cobranzaService.cerrarCaja(nameUser).subscribe({
      next: (data) => {
        this.collectionDay = data.total;
        this.cargandoDatosCierre = false;
        this.mostrarMensajeExito();
      },
      error: (error) => {
        console.log("Error en el calculo de recaudacion: ", error);
      },
    })
  }

  loadData() {
    this.loading = true;
    // Fuerza el spinner a mostrarse

    this.cobranzaService.getVentas({ page: this.page, pageSize: this.pageSize, search: this.search, selectedDate: this.selectedDate }).subscribe({
      next: (data) => {
        console.log(data)
        this.ventas = data.ventas;
        this.ventas = this.ventas.map(client => {
          return {
            ...client,
            fecha: client.fecha.replace('T', ' ').replace('Z', '')
          };
        });
        this.total = data.total;
        this.loading = false;
      },
      error: (error) => {
        console.log("Error en el pedido de clientes del dia: ", error);
        this.loading = false;
        ;
      },
    })

  }

  isAdmin() {
    return this.authService.esAdmin();
  }

  updateClient(client: any) {

    const dialogRef = this.dialog.open(RegisterClienteComponent, {
      maxWidth: '100%',
      data: { client, accion: "editar" },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'submit') {
        this.loadData();
      }
    });
  }

  deleteClient(client: any) {
    const idClient = client.id;

    this.cobranzaService.deleteClient(idClient).subscribe({
      next: () => {
        this.loadData();
        ;
      },
      error: (error) => {
        console.log("Error en la eliminacion del cliente: ", error);
      },
    })
  }

  nuevaCobranza(accion: string, data: any = null) {
    this.dialogRef = this.dialog.open(RegisterClienteComponent, {
      maxWidth: '100%',
      disableClose: false,
      autoFocus: true,
      data: { accion, data },
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
      if (result == 'submit') {
        this.resetComponent();
        this.loadData();
      }
    });

  }

  private resetComponent() {
    this.ventas = [];
    this.clientEdit = null;
    this.collectionDay = -1;
    //this.loadData();
    ;
  }

  openHistorial() {
    this.dialogRef2 = this.dialog.open(HistorialClientsComponent, {
      width: '47vw',
      maxWidth: '100vw',
      data: {},
      disableClose: false,
      autoFocus: true,
    });

    this.dialogRef2.componentInstance.isLoading = true;

    this.dialogRef2.afterClosed().subscribe(() => {
      this.dialogRef2 = null!;
    });

    this.cobranzaService.getHistory().subscribe({
      next: (data) => {

        this.historyCierres = data ?? [];

        this.dialogRef2.componentInstance.isLoading = false;
        this.dialogRef2.componentInstance.historial = data;
      },
      error: (error) => {
        console.error(error);
      },
    })

  }

  openModalCloseDay() {
    this.mostrarModalCierre = true;
    this.cargandoDatosCierre = true;

    this.cobranzaService.getCierreCaja().subscribe({
      next: (data) => {
        console.log(data);
        this.datosCierreCaja = data;
        this.cargandoDatosCierre = false;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  getTotal(cliente: any): number {
    let suma = 0;
    suma += Number(cliente.efectivo);
    suma += Number(cliente.debito);
    suma += Number(cliente.credito);
    suma += Number(cliente.transferencia);
    suma += Number(cliente.cheque);
    suma -= Number(cliente.gasto);
    return suma;
  }

  fitrarFecha() {
    this.loading = true;
    if (this.selectedDate == '') {
      this.loadData();
    }

    this.cobranzaService.getClientsByDate(this.selectedDate).subscribe({
      next: (data) => {
        this.ventas = data;
      },
      error: (error) => {
        console.log("Error en el pedido de clientes del dia: ", error);
      },
      complete: () => {
        this.loading = false;
      }
    })
  }

  openDeleteConfirm(client: any) {
    let titulo = 'Confirmar borrado';
    let mensaje = '';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: titulo,
        message: mensaje
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteClient(client);
      }
    })
  }

  cerrarModalCierre() {
    this.mostrarModalCierre = false;
  }

  mostrarMensajeExito() {
    this.successMessage = true;
    setTimeout(() => {
      this.successMessage = false;
      this.mostrarModalCierre = false;
      this.loadData();
    }, 1000);
  }

  // METODOS PAGINADO y FILTRO BUSQUEDA
  setPageSize(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.loadData();
  }

  handlePageEvent(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.loadData();
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize);
  }

  onSearchChange() {
    this.loadData();
  }
}