import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { RegisterComponent } from './componentes/auth/register/register.component';
import { LoginComponent } from './componentes/auth/login/login.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { authGuard } from './auth-guard.guard';
import { CobranzaComponent } from './componentes/cobranza/cobranza.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'cobranza',
        component: CobranzaComponent,
      },
      {
        path: 'productos',
        component: ProductosComponent
      }
    ],
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }