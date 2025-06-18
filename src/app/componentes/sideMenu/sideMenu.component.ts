import { Component, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../confirmDialog/confirmDialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sideMenu',
  templateUrl: './sideMenu.component.html',
  styleUrls: ['./sideMenu.component.css']
})
export class SideMenuComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
  ) { }

  roles: string[] = []

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
    {
      nombre: 'Carga',
      icono: 'fa-solid fa-user',
    },
  ];
  seccionesDisponibles: { nombre: string, icono: string }[] = []

  ngOnInit() {
    this.roles = this.authService.getUserRoles();
    this.filtrarSecciones();
  }

  filtrarSecciones() {
    if(this.roles.includes('Admin')){
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
