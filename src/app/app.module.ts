import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HomeComponent } from './componentes/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './componentes/auth/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { LoginComponent } from './componentes/auth/login/login.component';
import { SideMenuComponent } from './componentes/sideMenu/sideMenu.component';
import { CardComponent } from './componentes/card/card.component';
import { InformacionComponent } from './componentes/informacion/informacion.component';
import { EstadisticasComponent } from './componentes/estadisticas/estadisticas.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios/usuarios.component';
import { MatDialogModule } from '@angular/material/dialog';
import { UsuarioModalComponent } from './componentes/usuarios/usuarioModal/UsuarioModal.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app-routing.module';
import { UsuarioCardComponent } from './componentes/usuarios/usuarioCard/usuarioCard.component';
import { CobranzaComponent } from './componentes/cobranza/cobranza.component';
import { RegisterClienteComponent } from './componentes/cobranza/registerCliente/registerCliente.component';
import { ConfirmDialogComponent } from './componentes/confirmDialog/confirmDialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientesComponent } from './componentes/clientes/clientes.component';
import { InsertarClienteComponent } from './componentes/clientes/insertarCliente/insertarCliente.component';
import { CargaProductosComponent } from './componentes/cargaProductos/cargaProductos.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SideMenuComponent,
    CardComponent,
    RegisterComponent,
    LoginComponent,
    DashboardComponent,
    InformacionComponent,
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
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatInputModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
