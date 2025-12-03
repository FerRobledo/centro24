import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';
@Component({
  selector: 'app-detailsHistorial',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './detailsHistorial.component.html'
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
    this.getDetailsById()
  }

  getDetailsById() {
    const idAdmin = this.authService.getIdAdmin();
    this.isLoading = true;

    if (idAdmin) {
      this.subscriptions.add(
        this.cobranzaService.getDetailsId(idAdmin, this.idCierre).subscribe({
          next: (data) => {
            this.detailsCurrent = data.data;//data tiene dos objetos y accedo con .detalles o .totales
            console.log(this.detailsCurrent);
            this.isLoading = false;
          },
          error: (error) => {
            console.log("Error en el GET de details: ", error);
            this.isLoading = false;
          },
        })
      );
    } else {
      console.log("Error falta el id admin");
    }
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

}
