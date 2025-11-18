import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroClientes',
  standalone: true,
})
export class FiltroClientesPipe implements PipeTransform {
  transform(lista: any[], campo: string, valor: string): any[] {
    if (!valor) return lista;

    const valorLower = valor.toLowerCase();

    return lista.filter(item =>
      item.tipo?.toLowerCase().includes(valorLower) ||
      item.cliente?.toLowerCase().includes(valorLower) ||
      item.id_client?.toString().includes(valor)
    );
  }
}