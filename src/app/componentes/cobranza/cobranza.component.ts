import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from 'src/app/services/cobranza.service';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza.component.html',
  styleUrls: ['./cobranza.component.css']
})
export class CobranzaComponent implements OnInit {
  clientesDelDia: any[] = [];

  constructor(private cobranzaService: CobranzaService, private authService: AuthService) {
    console.log('Componente init');
  }

  ngOnInit() {
    const id = this.authService.getUserId();
    if (id) {
      this.cobranzaService.getClientesDelDia(id).subscribe({

        next: (data) => {
          //si hay data entonces hago un .add
          this.clientesDelDia = data;
          console.log("Los clientes son: ", data);
        },
        error: (error) => {
          console.log("Error en el pedido de clientes del dia: ", error)
        },
        complete: () => {
          console.log("Pedido en estado OK");
        }
      })
    }
  }

}
