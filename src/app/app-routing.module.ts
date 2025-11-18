import { Routes } from '@angular/router';
import { RegisterComponent } from './componentes/auth/register/register.component';
import { LoginComponent } from './componentes/auth/login/login.component';
import { COBRANZA_ROUTES } from './componentes/cobranza/cobranza.routes';
import { AuthGuard } from './auth/auth.guard';
import { CLIENTES_ROUTES } from './componentes/clientes/clientes.routes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./componentes/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [{
      path: 'cobranza',
      children: COBRANZA_ROUTES,
    },
    {
      path: 'clientes',
      children: CLIENTES_ROUTES,
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
    ]
  }
];