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
    }
  ];

  ngOnInit() {
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
