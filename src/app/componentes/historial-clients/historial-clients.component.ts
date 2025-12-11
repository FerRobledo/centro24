import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
import { DetailsHistorialComponent } from '../detailsHistorial/detailsHistorial.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial-clients',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './historial-clients.component.html'
})
export class HistorialClientsComponent {
  isLoading = false;
  dialogRef2: MatDialogRef<any> | null = null;
  selectedDate: string = '';
  private subscriptions: Subscription = new Subscription();
  historial: any[] = [];


  constructor(
    public dialogRef: MatDialogRef<HistorialClientsComponent>,
    private authService: AuthService,
    public dialog: MatDialog,
    private cobranzaService: CobranzaService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
  ) {  

  }

  ngOnInit(): void {
    this.initHistorial();
  }
  
  private initHistorial(): void {
    this.historial = Array.isArray(this.data) ? [...this.data] : [];//this.historial = [...this.data]; 
  }

  fitrarFecha() {
    this.isLoading = true;
    if (this.selectedDate == '') {
      this.initHistorial();
    }
    const idAdmin = this.authService.getIdAdmin();
    this.subscriptions.add(
      this.cobranzaService.getHistorialByDate(idAdmin, this.selectedDate).subscribe({
        next: (data) => {
          this.historial = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.log("Error en el pedido de historial por dia: ", error);
          this.isLoading = false;
        },
      })
    )
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  insertDate(data: any){
    this.historial.push(data);
  }

  openDetails(id: number) {
    this.dialogRef2 = this.dialog.open(DetailsHistorialComponent, {   
      data: id,//le paso el id del detalle seleccionado
      disableClose: false,
      autoFocus: true,
    })
  }
}
