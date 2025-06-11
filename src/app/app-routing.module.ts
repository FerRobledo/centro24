import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { RegisterComponent } from './componentes/auth/register/register.component';
import { LoginComponent } from './componentes/auth/login/login.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { authGuard } from './auth-guard.guard';
import { CobranzaComponent } from './componentes/cobranza/cobranza.component';
import { UsuarioModalComponent } from './componentes/usuarios/usuarioModal/UsuarioModal.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios/usuarios.component';

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
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }