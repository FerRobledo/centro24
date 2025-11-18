import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./clientes.component').then(m => m.ClientesComponent),
  },
  {
    path: 'listaPagos',
    loadComponent: () => import('./listaPagos/listaPagos.component').then(m => m.ListaPagosComponent),
  }
];
