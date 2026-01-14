import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SheetsService } from 'src/app/services/sheets.service';
import { ModalCargaProductosComponent } from '../modalCargaProductos/modalCargaProductos.component';
import { Producto } from 'src/assets/dto/producto';
import { ProductosService } from 'src/app/services/productos.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cargaProductos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cargaProductos.component.html',
  styleUrls: []
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
  productos: Producto[] = [];
  metricasImportacion: any = {}
  mostrarResumen = false;

  ngOnInit() {
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
            map((data: any[]) => {
              if (!data || !Array.isArray(data)) {
                console.error(`No se encontraron datos en la hoja ${hoja}`);
                return [];
              }

              return data
                .filter((fila: any[]) => fila?.length >= 3)
                .map((fila: any[]) => {
                  const [id, descripcion, precio_costo_str] = fila;
                  const precio_costo = Number(String(precio_costo_str ?? '0').replace(/[^0-9]/g, ''));
                  const ganancia = 65;

                  return {
                    id,
                    id_admin: 0,
                    descripcion,
                    precio_costo,
                    ganancia,
                    categoria: hoja,
                    stock: 0
                  } as Producto;
                });
            })
          );
        });

        forkJoin(observables).subscribe(
          (resultadosPorHoja => {
            const todosLosProductos = (resultadosPorHoja as Producto[][]).flat();
            this.productos = todosLosProductos;

            this.productosService.crearMultiplesProductos(this.productos).subscribe({
              next: (response) => {
                this.metricasImportacion = response.metricas;
                console.log(this.metricasImportacion);
                // opcional: mostrar resumen antes de navegar
                this.mostrarResumen = true;
              },
              error: err => {
                console.error('Error durante la carga de productos', err);
              }
            });

          }),
          (err) => {
            console.error('Error al procesar alguna hoja:', err);
          }
        );
      }
    });
  }

  cerrarMetricas() {
    this.mostrarResumen = false;
    this.router.navigate(['/productos']);
    this.cargaFinalizada.emit();
  }
}


