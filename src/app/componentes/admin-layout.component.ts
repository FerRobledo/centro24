import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideMenuComponent } from './sideMenu/sideMenu.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideMenuComponent],
  template: `
  <div class="flex flex-col lg:flex-row bg-[url('/assets/images/fondo.png')] bg-cover bg-center">
    <app-sideMenu class="w-full lg:w-52 shrink-0 xs:w-1/3"></app-sideMenu>
    <div class="flex items-center w-full justify-center">
      <router-outlet></router-outlet>
    </div>
  </div>
  `
})
export class AdminLayoutComponent { }
