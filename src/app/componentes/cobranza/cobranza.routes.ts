import { Routes } from '@angular/router';

export const COBRANZA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cobranza.component').then(m => m.CobranzaComponent),
  }
];
