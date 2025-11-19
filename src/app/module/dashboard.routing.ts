import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from '../componentes/dashboard/dashboard.component';
import { CobranzaComponent } from '../componentes/cobranza/cobranza.component';
import { ProductosComponent } from '../componentes/productos/productos.component';
import { UsuariosComponent } from '../componentes/usuarios/usuarios/usuarios.component';
import { ClientesComponent } from '../componentes/clientes/clientes.component';
import { ListaClientesComponent } from '../componentes/clientes/listaClientes/listaClientes.component';
import { ListaPagosComponent } from '../componentes/clientes/listaPagos/listaPagos.component';

const routes: Routes = [
  {
    path: '',
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
        path: 'usuarios',
        component: UsuariosComponent,
      },
      {
        path: 'clientes',
        component: ClientesComponent,
        children: [
          {
            path: '',
            component: ListaClientesComponent,
          },
          {
            path: 'listaPagos',
            component: ListaPagosComponent,
          },
        ]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutes { }
