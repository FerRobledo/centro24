import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
@Component({
  selector: 'app-detailsHistorial',
  templateUrl: './detailsHistorial.component.html',
  styleUrls: ['./detailsHistorial.component.css']
})
export class DetailsHistorialComponent implements OnInit {
  idCierre!: number;
  detailsCurrent: any = null;
  private subscriptions = new Subscription(); // siempre va por fuera del constructor, contenedor de subs
  isLoading = false;

  constructor(
  @Inject(MAT_DIALOG_DATA) public data: number,
  private authService: AuthService,
  private cobranzaService: CobranzaService,
  ) {
     this.idCierre = data;
    }

  ngOnInit() {
    this.getDetailsById();
    console.log(this.data);
    
  }

  getDetailsById() {
    const idAdmin = this.authService.getIdAdmin();
    this.isLoading = true;

    if(idAdmin){
      this.subscriptions.add(
        this.cobranzaService.getDetailsId(idAdmin, this.idCierre).subscribe({
          next: (data) => {
            this.detailsCurrent = data;//data tiene dos objetos y accedo con .detalles o .totales
            this.isLoading=false;
          },
          error: (error) => {
            console.log("Error en el GET de details: ", error);
            this.isLoading=false;
          },
        })
      );
    } else {
      console.log("Error falta el id admin");
    }
  }
}
