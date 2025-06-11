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

import { AppRoutingModule } from './app-routing.module';

import { ProductosComponent } from './componentes/productos/productos.component';
import { CobranzaComponent } from './componentes/cobranza/cobranza.component';

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
    CobranzaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
