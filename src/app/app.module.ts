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
import { RouterModule } from '@angular/router';

import { UsuariosComponent } from './componentes/usuarios/usuarios/usuarios.component';
import { MatDialogModule } from '@angular/material/dialog';
import { UsuarioModalComponent } from './componentes/usuarios/usuarioModal/UsuarioModal.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';

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
  ],
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatInputModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
