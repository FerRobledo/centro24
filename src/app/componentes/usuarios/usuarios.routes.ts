import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent),
  }
];
