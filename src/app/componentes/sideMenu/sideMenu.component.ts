import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../confirmDialog/confirmDialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sideMenu',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sideMenu.component.html',
  styleUrls: ['./sideMenu.component.css']
})
export class SideMenuComponent implements OnInit, OnDestroy {

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
  ) { }

  roles: string[] = []
  nameUserCurrent: String = '';

  secciones: { nombre: string, icono: string }[] = [
    {
      nombre: 'Home',
      icono: 'fa-solid fa-house',
    },
    {
      nombre: 'Cobranza',
      icono: 'fa-solid fa-cash-register',
    },
    {
      nombre: 'Clientes',
      icono: 'fa-solid fa-user-group',
    },
    {
      nombre: 'Productos',
      icono: 'fa-solid fa-bag-shopping',
    },
    {
      nombre: 'Usuarios',
      icono: 'fa-solid fa-user',
    },
  ];
  seccionesDisponibles: { nombre: string, icono: string }[] = []

  ngOnInit() {
    this.roles = this.authService.getUserRoles();
    this.filtrarSecciones();
    this.nameUserCurrent = this.authService.getUserName();
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  filtrarSecciones() {
    if (this.roles.includes('Admin')) {
      this.seccionesDisponibles = this.secciones;
    } else {
      this.seccionesDisponibles = this.secciones.filter(seccion =>
        seccion.nombre === 'Home' ||
        this.roles.some(rol => rol.toLowerCase() === seccion.nombre.toLowerCase())
      );
    }
  }

  cerrarSesion(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
        this.router.navigate(['/login']);
      } else {
        console.log('Cancelado');
      }
    });
  }


}
