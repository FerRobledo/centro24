import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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
  isLoading:Boolean = true;

  constructor(private estadisticasService: EstadisticasService, private authService: AuthService) { }

  ngOnInit() {
    this.loadData(this.estadisticasService.getStatsPreviousMonth, 'collectionPreviousMonth');
    this.loadData(this.estadisticasService.getStatsCurrenMonth, 'collectionCurrentMonth');
    this.loadData(this.estadisticasService.getClients, 'cantClients');
    this.loadData(this.estadisticasService.getNewClients, 'newClients');
    this.loadData(this.estadisticasService.getUsersByAdmin, 'cantUsersByAdmin');
    this.loadData(this.estadisticasService.getCollectionYesterday, 'collectionYesterday', true);
  }
  //pasar servicio por parametros servicio: (id: number) => Observable<number>
  loadData(servicio: (id: number) => Observable<number>, propiedad: string, usarLoading: boolean = false) {
  const id = this.authService.getIdAdmin();
    if (id) {
      if (usarLoading) this.isLoading = true;
      servicio.call(this.estadisticasService, id).subscribe({ //llamo al servicio dependiendo el que me llegue
        next: (data) => {
          (this as any)[propiedad] = data;
        },
        error: (error) => {
          console.log("Error en el pedido de", propiedad, ":", error);
          if (usarLoading) this.isLoading = false;
        },
        complete: () => {
          console.log("Pedido en estado OK");
          if (usarLoading) this.isLoading = false;
        }
      });
    }
  }
}