import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../componentes/home/home.component';
import { DashboardComponent } from '../componentes/dashboard/dashboard.component';
import { CobranzaComponent } from '../componentes/cobranza/cobranza.component';
import { ProductosComponent } from '../componentes/productos/productos.component';
import { UsuariosComponent } from '../componentes/usuarios/usuarios/usuarios.component';
import { ClientesComponent } from '../componentes/clientes/clientes.component';
import { authGuard } from '../auth-guard.guard';
import { NotFoundComponent } from '../componentes/notFound/notFound.component';

const routes: Routes = [
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
        path: 'clientes',
        component: ClientesComponent
      },
      {
        path: '**',
        component: NotFoundComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutes { }
