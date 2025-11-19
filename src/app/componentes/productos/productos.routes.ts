import { Routes } from '@angular/router';

export const PRODUCTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./productos.component').then(m => m.ProductosComponent),
  }
];
