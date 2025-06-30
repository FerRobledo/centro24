import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargaProductosComponent } from '../componentes/cargaProductos/cargaProductos.component';
import { ClientesComponent } from '../componentes/clientes/clientes.component';
import { InsertarClienteComponent } from '../componentes/clientes/insertarCliente/insertarCliente.component';
import { CobranzaComponent } from '../componentes/cobranza/cobranza.component';
import { RegisterClienteComponent } from '../componentes/cobranza/registerCliente/registerCliente.component';
import { ConfirmDialogComponent } from '../componentes/confirmDialog/confirmDialog.component';
import { DashboardComponent } from '../componentes/dashboard/dashboard.component';
import { EstadisticasComponent } from '../componentes/estadisticas/estadisticas.component';
import { InformacionComponent } from '../componentes/informacion/informacion.component';
import { ProductosComponent } from '../componentes/productos/productos.component';
import { UsuarioCardComponent } from '../componentes/usuarios/usuarioCard/usuarioCard.component';
import { UsuarioModalComponent } from '../componentes/usuarios/usuarioModal/UsuarioModal.component';
import { UsuariosComponent } from '../componentes/usuarios/usuarios/usuarios.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CardComponent } from '../componentes/card/card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardRoutes } from './dashboard.routing';

@NgModule({
  declarations: [
    DashboardComponent,
    InformacionComponent,
    CardComponent,
    EstadisticasComponent,
    ProductosComponent,
    UsuariosComponent,
    UsuarioModalComponent,
    UsuarioCardComponent,
    CobranzaComponent,
    RegisterClienteComponent,
    ConfirmDialogComponent,
    ClientesComponent,
    InsertarClienteComponent,
    CargaProductosComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutes,
    ReactiveFormsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
  ],
  providers: [
    provideAnimationsAsync()
  ],
})
export class DashboardModule { }


