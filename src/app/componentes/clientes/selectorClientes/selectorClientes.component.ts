import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'app-selectorClientes',
  templateUrl: './selectorClientes.component.html',
  styleUrls: ['./selectorClientes.component.css']
})
export class SelectorClientesComponent implements OnInit {

  @Input() clientes: any[] = [];
  @Input() control!: FormControl<any>;
  @ViewChild(MatAutocompleteTrigger) autocomplete!: MatAutocompleteTrigger;
  clientesFiltrados: any[] = [];

  ngOnInit() {
    this.control.valueChanges
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
      return this.clientes.filter(cliente =>
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

  // Recalcular el monto
  seleccionarCliente(event: MatAutocompleteSelectedEvent) {
    this.control.setValue(event.option.value);
  }

  onFocus(event: FocusEvent) {
    // Cerramos el panel para que no se abra al hacer foco
    this.autocomplete.closePanel();
  }
}
