import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})


export class ProductosComponent implements OnInit {
  productos: any[] = [];

  constructor(private productosService: ProductosService) {
    console.log('Componente AppComponent inicializado');
  }

  
  ngOnInit() {
    console.log('ngOnInit ejecutándose');
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        console.log('Datos recibidos:', data);
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
      },
      complete: () => {
        console.log('Solicitud completada');
      }
    });
  }


  increaseStock(index: number) {
    this.productos[index].stock += 1;
  }

  decreaseStock(index: number) {
    if (this.productos[index].stock > 0) {
      this.productos[index].stock -= 1;
    }
  }

  showModal = false;
  selectedIndex: number | null = null;
  quantity: number = 1;

  openQuantityModal(index: number) {
    this.selectedIndex = index;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedIndex = null;
  }

  addQuantity(index: number) {
    if (this.quantity > 0) {
      this.productos[index].stock += this.quantity;
      this.closeModal();
    }
  }
}
