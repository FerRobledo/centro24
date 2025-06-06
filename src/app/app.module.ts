import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './componentes/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import { RegisterComponent } from './componentes/auth/register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { LoginComponent } from './componentes/auth/login/login.component';
import { SideMenuComponent } from './componentes/sideMenu/sideMenu.component';
import { CardComponent } from './componentes/card/card.component';
import { InformacionComponent } from './componentes/informacion/informacion.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    SideMenuComponent,
    DashboardComponent,
    CardComponent,
    InformacionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
