import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SheetsService } from 'src/app/services/sheets.service';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-modalCargaProductos',
  templateUrl: './modalCargaProductos.component.html',
  styleUrls: [],
  imports: [CommonModule, FormsModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule],
  standalone: true,
})
export class ModalCargaProductosComponent implements OnInit {

  hojas: string[] = [];
  todasSeleccionadas: boolean = false;
  estadoCheckboxes: { [key: string]: boolean } = {};

  constructor(
    public dialogRef: MatDialogRef<ModalCargaProductosComponent>,
    private sheetsService: SheetsService,
  ) { }


  ngOnInit() {
    this.loadPage();
  }

  loadPage() {
    this.sheetsService.cargarHojas().subscribe({
      next: (data) => {
        this.hojas = data.sheets.map((sheet: any) => sheet.properties.title);

        // Inicializar checkboxes en false
        this.hojas.forEach(hoja => {
          if (hoja !== '¿Quienes somos?' && hoja !== 'KITS' && hoja !== 'OUTLET') {
            this.estadoCheckboxes[hoja] = false;
          }
        });

        this.todasSeleccionadas = false;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }


  toggleSeleccionarTodas() {
    Object.keys(this.estadoCheckboxes).forEach(hoja => {
      if (hoja !== '¿Quienes somos?' && hoja !== 'KITS' && hoja !== 'OUTLET') {
        this.estadoCheckboxes[hoja] = this.todasSeleccionadas;
      }
    });
  }
  actualizarTodasSeleccionadas() {
    const valores = Object.entries(this.estadoCheckboxes)
      .filter(([hoja]) =>
        hoja !== '¿Quienes somos?' &&
        hoja !== 'KITS' &&
        hoja !== 'OUTLET'
      )
      .map(([_, v]) => v);

    this.todasSeleccionadas = valores.length > 0 && valores.every(v => v);
  }

  confirmar() {
    const seleccionadas = Object.entries(this.estadoCheckboxes)
      .filter(([_, v]) => v)
      .map(([k, _]) => k); // solo devuelve el nombre de las hojas
    this.dialogRef.close(seleccionadas);
  }

  cancelar() {
    this.dialogRef.close();
  }
}
