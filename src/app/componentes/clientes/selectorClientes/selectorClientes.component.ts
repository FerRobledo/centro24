import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-selectorClientes',
  templateUrl: './selectorClientes.component.html',
  styleUrls: ['./selectorClientes.component.css']
})
export class SelectorClientesComponent implements OnInit {
  clienteControl = new FormControl('');
  @Input() clientes: any;
  @Output() clienteSeleccionadoChange = new EventEmitter<any>();
  clientesFiltrados: any[] = [];

  constructor() { }

  ngOnInit() {
    console.log(this.clientes);
    this.clienteControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filtrarClientes(value || ''))
      )
      .subscribe(filtrados => {
        this.clientesFiltrados = filtrados;
      });
  }

  private filtrarClientes(valor: any): any[] {
    if (typeof valor === 'string') {
      const filtro = valor.toLowerCase();
      return this.clientes.filter((cliente: any) =>
        cliente.cliente.toLowerCase().includes(filtro) ||
        cliente.id_client.toString().toLowerCase().includes(filtro)
      );
    }
    return this.clientes;
  }

  mostrarCliente(cliente: any): string {
    return cliente
      ? `#${cliente.id_client} - ${cliente.cliente}`
      : '';
  }

  seleccionarCliente(event: MatAutocompleteSelectedEvent) {
    this.clienteSeleccionadoChange.emit(event.option.value);
  }
}
