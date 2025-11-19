import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductoDTO } from 'src/assets/dto/producto';

interface DialogData {
  producto: ProductoDTO;
  modoEdicion: boolean;
  esAdmin: boolean;
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [ FormsModule, CommonModule ], 
  templateUrl: './product-form-dialog.component.html'
})
export class ProductFormDialogComponent implements OnInit {
  productoLocal: ProductoDTO = new ProductoDTO();
  cargando: boolean = false;
  mensaje: string = '';

  constructor(
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    this.productoLocal = new ProductoDTO(this.data.producto);
  }

  onGuardar() {
    // Calcular y asignar el precio de venta antes de validar
    this.productoLocal.precio_venta = this.precioVenta;
    
    // Validaciones básicas
    const error = this.productoLocal.validateRequired();
    if (error) {
      this.mensaje = error;
      return;
    }

    this.dialogRef.close({
      action: 'guardar',
      producto: this.productoLocal
    });
  }

  onCancelar() {
    this.dialogRef.close({
      action: 'cancelar'
    });
  }

  get tituloDialog(): string {
    return this.data.modoEdicion ? 'Editar Producto' : 'Agregar Nuevo Producto';
  }

  get textoBoton(): string {
    return this.data.modoEdicion ? 'Actualizar' : 'Guardar';
  }

  get precioVenta(): number {
    const costo = this.productoLocal.precio_costo || 0;
    const ganancia = this.productoLocal.ganancia || 0;
    return costo + (costo * ganancia / 100);
  }
}