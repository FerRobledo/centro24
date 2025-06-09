import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { RegisterComponent } from './componentes/register/register.component';
import { AuthComponent } from './componentes/auth/auth.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'login',
        component: AuthComponent,
      },
      {
        path: 'registrarse',
        component: RegisterComponent,
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
