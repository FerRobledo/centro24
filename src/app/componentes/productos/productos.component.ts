import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})


export class ProductosComponent implements OnInit {
  products = [
    { name: 'Producto 1', description: 'Descripción del Producto 1', category: 'Electrónica', price: 10.99, stock: 50, image: null },
    { name: 'Producto 2', description: 'Descripción del Producto 2', category: 'Ropa', price: 15.50, stock: 30, image: null },
    { name: 'Producto 3', description: 'Descripción del Producto 3', category: 'Hogar', price: 7.25, stock: 75, image: null }
  ];

  ngOnInit() {}

  increaseStock(index: number) {
    this.products[index].stock += 1;
  }

  decreaseStock(index: number) {
    if (this.products[index].stock > 0) {
      this.products[index].stock -= 1;
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
      this.products[index].stock += this.quantity;
      this.closeModal();
    }
  }
}
