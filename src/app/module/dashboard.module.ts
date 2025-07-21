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
import { AgregarPagoModalComponent } from '../componentes/clientes/agregarPagoModal/agregarPagoModal.component';
import { ListaClientesComponent } from '../componentes/clientes/listaClientes/listaClientes.component';
import { ListaPagosComponent } from '../componentes/clientes/listaPagos/listaPagos.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardRoutes } from './dashboard.routing';
import { SideMenuComponent } from '../componentes/sideMenu/sideMenu.component';
import { HomeComponent } from '../componentes/home/home.component';
import { SelectorClientesComponent } from '../componentes/clientes/selectorClientes/selectorClientes.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FiltroClientesPipe } from 'src/app/pipes/filtro-clientes.pipe';
import { LogsComponent } from '../componentes/logs/logs.component';
import { ConfirmarDeleteComponent } from '../componentes/productos/confirmar-delete/confirmar-delete.component';
import { ProductFormComponent } from '../componentes/productos/product-form/product-form.component';

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
    AgregarPagoModalComponent,
    ListaClientesComponent,
    FiltroClientesPipe,
    ListaPagosComponent,
    SideMenuComponent,
    HomeComponent,
    SelectorClientesComponent,
    LogsComponent,
    ConfirmarDeleteComponent,
    ProductFormComponent,

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
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatDividerModule,
    MatTabsModule,
    MatAutocompleteModule,
],
  providers: [
    provideAnimationsAsync()
  ],
})
export class DashboardModule { }


