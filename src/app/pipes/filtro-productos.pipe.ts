import { Pipe, PipeTransform } from '@angular/core';
import { ProductoDTO } from 'src/assets/dto/producto';

@Pipe({
  name: 'filtroProductos',
  standalone: true
})

export class FiltroProductosPipe implements PipeTransform {

  transform(productos: ProductoDTO[], filtroTexto: string, filtroStock: boolean = false): ProductoDTO[] {
    if(!productos) 
      return [];

    let resultado = [...productos];

    // 1. Filtrar por stock si el toggle esta activado
    if (filtroStock) {
      resultado = resultado.filter(p => p.stock > 0);
    }

    // 2. Filtrar por texto si hay busqueda (strings)
    if (filtroTexto && filtroTexto.trim()) {
      const filtroLower = filtroTexto.toLowerCase().trim();

      resultado = resultado.filter(p => 
        p.id.toLowerCase().includes(filtroLower) ||
        (p.descripcion?.toLocaleLowerCase() || '').includes(filtroLower) ||
        p.categoria.toLowerCase().includes(filtroLower)
      );
    }
    
    return resultado;
  }

}
