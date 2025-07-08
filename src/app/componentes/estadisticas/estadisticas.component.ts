import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  collectionPreviousMonth:number = 0;
  collectionCurrentMonth:number = 0;
  cantClients:number = 0;
  newClients:number = 0;
  cantUsersByAdmin:number = 0;
  collectionYesterday:number = 0;
  isLoading: boolean = true; 

  private dialogRef: MatDialogRef<any> | null = null; //aca 
  private subscriptions: Subscription = new Subscription();

  constructor(private estadisticasService: EstadisticasService, private authService: AuthService, public dialog: MatDialog, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadData(this.estadisticasService.getStatsPreviousMonth, 'collectionPreviousMonth');
    this.loadData(this.estadisticasService.getStatsCurrenMonth, 'collectionCurrentMonth');
    this.loadData(this.estadisticasService.getClients, 'cantClients');
    this.loadData(this.estadisticasService.getNewClients, 'newClients');
    this.loadData(this.estadisticasService.getUsersByAdmin, 'cantUsersByAdmin');
    this.loadData(this.estadisticasService.getCollectionYesterday, 'collectionYesterday', true);
  }

  loadData(servicio: (id: number) => Observable<number>, propiedad: string, usarLoading: boolean = false) {
  const id = this.authService.getIdAdmin();
    if (id) {
      if (usarLoading) this.isLoading = true;
      this.cdr.detectChanges(); //revisá este componente ya mismo por si hay algo que cambió y actualizá el HTML.
      servicio.call(this.estadisticasService, id).subscribe({ //llamo al servicio dependiendo el que me llegue
        next: (data) => {
          (this as any)[propiedad] = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log("Error en el pedido de", propiedad, ":", error);
          if (usarLoading) this.isLoading = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          console.log("Pedido en estado OK");
          if (usarLoading) this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    this.dialog.closeAll(); //cierra todos los diálogos al destruir el componente
    this.subscriptions.unsubscribe(); //limpia todas las suscripciones
  }
}