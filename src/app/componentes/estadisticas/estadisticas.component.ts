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
  collectionPreviousMonth: number = 0;
  collectionCurrentMonth: number = 0;
  cantClients: number = 0;
  newClients: number = 0;
  cantUsersByAdmin: number = 0;
  collectionYesterday: number = 0;
  isLoading: boolean = true;
  data: any = '';
  private dialogRef: MatDialogRef<any> | null = null; //aca 
  private subscriptions: Subscription = new Subscription();

  constructor(private estadisticasService: EstadisticasService, private authService: AuthService, public dialog: MatDialog, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    const id = this.authService.getIdAdmin();
    if (id) {
      ; //revisá este componente ya mismo por si hay algo que cambió y actualizá el HTML.
      this.estadisticasService.getStats(id).subscribe({ //llamo al servicio dependiendo el que me llegue
        next: (data) => {
          this.collectionPreviousMonth = data.previous;
          this.collectionCurrentMonth = data.current;
          this.cantClients = data.clients;
          this.newClients = data.newClients;
          this.cantUsersByAdmin = data.users;
          this.collectionYesterday = data.yesterday;
          ;
        },
        error: (error) => {
          console.log(error);
          ;
        },
        complete: () => {
          this.isLoading = false;
          ;
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

  get esAdmin(){
    return this.authService.esAdmin();
  }
}