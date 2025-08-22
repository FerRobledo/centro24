import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-selectorClientes',
  templateUrl: './selectorClientes.component.html',
  styleUrls: ['./selectorClientes.component.css']
})
export class SelectorClientesComponent implements OnInit {

  @Input() clientes: any[] = [];
  @Input() control!: FormControl<any>;

  clientesFiltrados: any[] = [];
  mostrarOpciones: boolean = false;
  busqueda: string = ''; // para el ngModel


  ngOnInit() {
    // Inicializamos filtrados
    this.clientesFiltrados = [...this.clientes];

    // Si querés seguir usando FormControl
    if (this.control) {
      this.control.valueChanges.subscribe(value => {
        this.filtrarClientes();
        this.mostrarOpciones = true;
      });
    }
  }


  filtrarClientes() {
    const valor = this.busqueda.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.cliente.toLowerCase().includes(valor) ||
      cliente.id_client.toString().includes(valor)
    );
    this.mostrarOpciones = true
  }

  ocultarOpciones() {
    // usamos un timeout para que el click en la opción se registre antes de cerrar
    setTimeout(() => {
      this.mostrarOpciones = false;
    }, 150);
  }

  seleccionarCliente(cliente: any) {
    this.busqueda = `#${cliente.id_client} - ${cliente.cliente}`;
    this.control.setValue(cliente); // si querés seguir usando FormControl
    this.mostrarOpciones = false;
  }

  mostrarCliente(cliente: any): string {
    return cliente ? `#${cliente.id_client} - ${cliente.cliente}` : '';
  }

  onFocus() {
    this.mostrarOpciones = true;
  }

  onBlur() {
    setTimeout(() => {
      this.mostrarOpciones = false;
    }, 150); // para permitir click en opción
  }
}
