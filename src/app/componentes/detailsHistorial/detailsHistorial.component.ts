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

  constructor(
  @Inject(MAT_DIALOG_DATA) public data: number,
  private authService: AuthService,
  private cobranzaService: CobranzaService,
  ) {
     this.idCierre = data;
    }

  ngOnInit() {
    this.getDetailsById();
  }

  getDetailsById() {
    const idAdmin = this.authService.getIdAdmin();

    console.log('admin:', idAdmin, 'cierre:', this.idCierre);
    if(idAdmin){
      this.subscriptions.add(
        this.cobranzaService.getDetailsId(idAdmin, this.idCierre).subscribe({
          next: (data) => {
            this.detailsCurrent = data;
            console.log("la pegue a la primera? ", this.detailsCurrent); //siempre que quiera mostrar un OBJECT va con coma
          },
          error: (error) => {
            console.log("Error en el GET de details: ", error);
          },
        })
      );
    } else {
      console.log("Error falta el id admin");
    }
  }
}
