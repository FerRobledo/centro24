import { isNgTemplate } from '@angular/compiler';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DetailsHistorialComponent } from '../detailsHistorial/detailsHistorial.component';

@Component({
  selector: 'app-historial-clients',
  templateUrl: './historial-clients.component.html',
  styleUrls: ['./historial-clients.component.css'],
})
export class HistorialClientsComponent {
  historial: any[] = [];
  dialogRef2: MatDialogRef<any> | null = null;

  constructor(
    public dialogRef: MatDialogRef<HistorialClientsComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
  ) {
    this.historial = data;
    console.log(this.historial);
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  insertDate(data: any){
    this.historial.push(data);
  }

  openDetails(id: number) {
    this.dialogRef2 = this.dialog.open(DetailsHistorialComponent, {
      maxWidth: '100%',
      data: id,//le paso el id del detalle seleccionado
      disableClose: false,
      autoFocus: true,
    })
  }
}
