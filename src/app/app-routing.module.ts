import { Routes } from '@angular/router';
import { RegisterComponent } from './componentes/auth/register/register.component';
import { LoginComponent } from './componentes/auth/login/login.component';
import { COBRANZA_ROUTES } from './componentes/cobranza/cobranza.routes';
import { AuthGuard } from './auth/auth.guard';
import { CLIENTES_ROUTES } from './componentes/clientes/clientes.routes';
import { PRODUCTO_ROUTES } from './componentes/productos/productos.routes';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { USUARIOS_ROUTES } from './componentes/usuarios/usuarios.routes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./componentes/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'cobranza',
        children: COBRANZA_ROUTES,
      },
      {
        path: 'clientes',
        children: CLIENTES_ROUTES,
      },
      {
        path: 'productos',
        children: PRODUCTO_ROUTES,
      },
      {
        path: 'usuarios',
        children: USUARIOS_ROUTES,
      },
      { path: '**', redirectTo: '/login' }
    ]
  }
];