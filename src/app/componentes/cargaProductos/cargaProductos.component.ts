import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SheetsService } from 'src/app/services/sheets.service';
import { ModalCargaProductosComponent } from '../modalCargaProductos/modalCargaProductos.component';
import { ProductoDTO } from 'src/assets/dto/producto';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-cargaProductos',
  templateUrl: './cargaProductos.component.html',
  styleUrls: ['./cargaProductos.component.css']
})
export class CargaProductosComponent implements OnInit {

  constructor(
    private sheetsService: SheetsService,
    private productosService: ProductosService,
    public dialog: MatDialog,
  ) { }

  productos: ProductoDTO[] = [];

  ngOnInit() {
    this.sheetsService.cargarHojas();
  }

  hojasForm() {
    const dialogRef = this.dialog.open(ModalCargaProductosComponent, {
      maxWidth: '100%',
    });

    // Cuando se cierra el diálogo, se obtiene la lista de hojas seleccionadas
    // y se procede a cargar los productos de cada hoja.
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.forEach((hoja: string) => {
          this.productos = [];
          this.sheetsService.getData(hoja).subscribe({
            next: data => {
              let values = data;
              if (!values || !Array.isArray(values)) {
                console.error(`No se encontraron datos en la hoja ${hoja}`);
                return;
              }

              // Filtrar filas válidas: deben tener exactamente 3 columnas y no estar vacías
              const productosDeHoja = values
                .filter((fila: any[]) => fila.length === 3 && fila.every(col => col && col.trim() !== '')) // filtrar válidas
                .map((fila: any[]) => {
                  const [id, descripcion, precio_costo_str] = fila;
                  const precio_costo = Number(precio_costo_str.replace(/[^0-9]/g, ''));
                  const ganancia = 65;
                  // Calcular precio de venta y que tenga maximo 2 decimales
                  const precio_venta = Number(((Number(precio_costo) + (Number(precio_costo) * ganancia / 100)).toFixed(2)));
                  return {
                    id,
                    id_admin: 0,
                    descripcion,
                    precio_costo,
                    precio_venta,
                    ganancia,
                    categoria: hoja,
                    stock: 0,
                  } as ProductoDTO;
                });
              this.productos.push(...productosDeHoja);
              this.productosService.addAllProductos(this.productos);
            },
            error: error => {
              console.error(`Error al obtener datos de la hoja ${hoja}:`, error);
            }
          });

        });
      }
    });
  }


}


