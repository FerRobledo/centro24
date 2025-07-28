import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-historial-clients',
  templateUrl: './historial-clients.component.html',
  styleUrls: ['./historial-clients.component.css'],
})
export class HistorialClientsComponent {
  historial: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<HistorialClientsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
  ) {
    this.historial = data;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  insertDate(data: any){
    this.historial.push(data);
  }
  /*
  loadHistory(){ 
    for() {

    }
  }*/
}
