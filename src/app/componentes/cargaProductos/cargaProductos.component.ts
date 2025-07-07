import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SheetsService } from 'src/app/services/sheets.service';
import { ModalCargaProductosComponent } from '../modalCargaProductos/modalCargaProductos.component';
import { ProductoDTO } from 'src/assets/dto/producto';
import { ProductosService } from 'src/app/services/productos.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cargaProductos',
  templateUrl: './cargaProductos.component.html',
  styleUrls: ['./cargaProductos.component.css']
})
export class CargaProductosComponent implements OnInit, OnDestroy {

  constructor(
    private sheetsService: SheetsService,
    private productosService: ProductosService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  @Output() cargaFinalizada = new EventEmitter<void>();
  @Output() cargaIniciada = new EventEmitter<void>();
  productos: ProductoDTO[] = [];

  ngOnInit() {
    this.sheetsService.cargarHojas();
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  hojasForm() {
    const dialogRef = this.dialog.open(ModalCargaProductosComponent, {
      maxWidth: '100%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargaIniciada.emit();

        // Crear un array de observables para cada hoja
        const observables = result.map((hoja: string) => {
          return this.sheetsService.getData(hoja).pipe(
            // Procesamos los datos de cada hoja
            map((data: any[]) => {
              if (!data || !Array.isArray(data)) {
                console.error(`No se encontraron datos en la hoja ${hoja}`);
                return [];
              }

              return data
                .filter((fila: any[]) => fila.length === 3 && fila.every(col => col && col.trim() !== ''))
                .map((fila: any[]) => {
                  const [id, descripcion, precio_costo_str] = fila;
                  const precio_costo = Number(precio_costo_str.replace(/[^0-9]/g, ''));
                  const ganancia = 65;
                  const precio_venta = Number(((precio_costo + (precio_costo * ganancia / 100)).toFixed(2)));
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
            })
          );
        });
        // Ejecutar todos los observables y esperar a que todos terminen
        forkJoin(observables).subscribe(
          (resultadosPorHoja => {
            // Flatten del array de arrays
            const todosLosProductos = (resultadosPorHoja as ProductoDTO[][]).flat();
            this.productos = todosLosProductos;

            this.productosService.addAllProductos(this.productos).subscribe({
              complete: () => {
                this.cargaFinalizada.emit();
              },
              error: err => {
                console.error('Error durante la carga de productos', err);
              }
            });

            this.router.navigate(['/productos']);
          }),
          (err) => {
            console.error('Error al procesar alguna hoja:', err);
          }
        );
      }
    });
  }
}


