import { Component, OnInit } from '@angular/core';
import { CobranzaService } from 'src/app/services/cobranza.service';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza.component.html',
  styleUrls: ['./cobranza.component.css']
})
export class CobranzaComponent implements OnInit {
  clientesDelDia: any[] = [];

  constructor(private cobranzaService: CobranzaService) { 
    console.log('Componente init');
  }

  ngOnInit() {
    console.log('ngOnit ejecutandose');
    this.cobranzaService.getClientesDelDia().subscribe({
    
      next: (data) => {
        //si hay data entonces hago un .add
        this.clientesDelDia = data;
        console.log("Los clientes son: ",data);
      },
      error: (error) => {
        console.log("Error en el pedido de clientes del dia: ",error)
      },
      complete: () => {
        console.log("Pedido en estado OK");
      }
    })
  }

}
