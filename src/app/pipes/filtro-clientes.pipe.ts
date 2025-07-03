import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroClientes'
})
export class FiltroClientesPipe implements PipeTransform {
  transform(lista: any[], campo: string, valor: string): any[] { //lista es la de clients, campo es porq lo quiero filtrar y valor es lo que escribo en el input
    if (!valor) return lista;
    return lista.filter(item => item[campo]?.toLowerCase().includes(valor.toLowerCase()));
  }
}
