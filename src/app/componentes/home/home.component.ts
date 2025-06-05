import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // Para usar el servicio hay que ponerlo en el constructor
  constructor(private testServicio: TestService) { }

  personas: {id: number, nombre:string}[] = []
  cargando: boolean = true;

  // AL INICIAR EL COMPONENTE LLAMA A getNombres()
  ngOnInit() {
    this.getNombres();
  }

  getNombres() {
    // El servicio nos va a devolver un Observable con la info
    this.testServicio.getNombres().subscribe({
      next: (data) => {
        // data es lo que devuelve la api
        this.personas = data;
      },
      error: (error) => {
        // Esto por si tira error
        console.log(error)
      },
      complete: () => {
        this.cargando = false;
      }
    })
  }


}
