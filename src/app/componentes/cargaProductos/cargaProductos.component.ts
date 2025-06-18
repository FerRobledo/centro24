import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SheetsService } from 'src/app/services/sheets.service';
import { ModalCargaProductosComponent } from '../modalCargaProductos/modalCargaProductos.component';
import { Producto } from 'src/assets/dto/producto';

@Component({
  selector: 'app-cargaProductos',
  templateUrl: './cargaProductos.component.html',
  styleUrls: ['./cargaProductos.component.css']
})
export class CargaProductosComponent implements OnInit {

  constructor(
    private sheetsService: SheetsService,
    public dialog: MatDialog,
  ) { }

  productos: Producto[] = [];

  ngOnInit() {
    this.sheetsService.cargarHojas();
  }

  // hojasForm() {
  //   const dialogRef = this.dialog.open(ModalCargaProductosComponent, {
  //     maxWidth: '100%',
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     result.forEach((hoja: any) => {
  //       this.sheetsService.getData(hoja).subscribe({
  //         next: data => {
  //           console.log(`Datos de la hoja ${ hoja }:`, data);
  //         },
  //         error: error => {
  //           console.error(`Error al obtener datos de la hoja ${ hoja }:`, error);
  //         }
  //       })
  //     });
  //   });
  // }

  hojasForm() {
    const dialogRef = this.dialog.open(ModalCargaProductosComponent, {
      maxWidth: '100%',
    });

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

              const productosDeHoja = values
                .filter((fila: any[]) => fila.length === 3 && fila.every(col => col && col.trim() !== '')) // filtrar válidas
                .map((fila: any[]) => {
                  const [id, descripcion, precio_costo_str] = fila;
                  const precio_costo = parseFloat(precio_costo_str);
                  const precio_venta = !isNaN(precio_costo) ? precio_costo : 0;

                  return {
                    id,
                    id_admin: 0,
                    descripcion,
                    precio_costo,
                    precio_venta,
                    ganancia: 0,
                    categoria: hoja,
                    stock: 0,
                  } as Producto;
                });

              this.productos.push(...productosDeHoja);
              console.log(`Productos agregados desde la hoja ${hoja}:`, productosDeHoja);
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


