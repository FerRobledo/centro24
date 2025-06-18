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
  styleUrls: ['./modalCargaProductos.component.css'],
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
    this.sheetsService.hojas$.subscribe(hojas => {
      this.hojas = hojas;
      hojas.forEach(hoja => this.estadoCheckboxes[hoja] = false);
    });
    this.sheetsService.cargarHojas();
  }

  toggleSeleccion() {
    this.actualizarTodasSeleccionadas();
  }

  toggleSeleccionarTodas() {
    const nuevoEstado = this.todasSeleccionadas;
    Object.keys(this.estadoCheckboxes).forEach(hoja => {
      if (hoja !== '¿Quienes somos?' && hoja !== 'KITS' && hoja !== 'OUTLET') {
        this.estadoCheckboxes[hoja] = nuevoEstado;
      }
    });
  }

  actualizarTodasSeleccionadas() {
    this.todasSeleccionadas = Object.values(this.estadoCheckboxes).every(v => v);
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
