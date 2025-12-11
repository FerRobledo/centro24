import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Producto } from 'src/assets/dto/producto';

interface DialogData {
  producto: Producto;
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
  productoLocal: Producto = {
    id: '',
    precio_costo: 0,
    descripcion: null,
    imagen: null,
    stock: 0,
    categoria: '',
    id_admin: 0,
    ganancia: null,
    precio_venta: 0,
    cantidadModificar: null
  };
  cargando: boolean = false;
  mensaje: string = '';

  constructor(
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    this.productoLocal = { ...this.data.producto };
  }

  onGuardar() {
    // Validaciones básicas
    if (!this.productoLocal.id || !this.productoLocal.categoria || this.productoLocal.precio_costo < 0) {
      this.mensaje = 'Por favor completa todos los campos requeridos';
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