import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../confirmDialog/confirmDialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MercadopagoService } from 'src/app/services/mercadopago.service';

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
    private mercadoPagoService: MercadopagoService,
  ) { }

  roles: string[] = []
  nameUserCurrent: String = '';

  advertenciaVisible: boolean = true;
  diasRestantes: any = null;
  esperandoPago: boolean = false;
  errorPago: string = '';

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
    this.calcularDiasRestantes();
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

  calcularDiasRestantes() {
    const fecha = this.authService.getFechaVencimiento();
    // Si no hay fecha → no calcular nada
    if (!fecha) {
      this.diasRestantes = -1;
      return;
    }
    const oneDay = 24 * 60 * 60 * 1000;
    
    const hoy = new Date();
    const vencimiento = new Date(fecha);

    const diff = vencimiento.getTime() - hoy.getTime();
    this.diasRestantes = Math.ceil(diff / oneDay);
  }

  mostrarAdvertencia() {
    const isAdmin = this.roles.includes('Admin');
    if (!isAdmin) return false;
    // Si no hay días calculados (fecha vencimiento null) → mostrar advertencia
    if (this.diasRestantes === null) return true;

    // Si está habilitado, mostrar solo si faltan 5 días o menos
    return this.diasRestantes <= 5;
  }

  cerrarAdvertencia() {
    this.advertenciaVisible = false;
    this.errorPago = ''
  }

  redirigirMercadoPago() {
    // Solo los admins pueden realizar pago por MP
    if (this.authService.esAdmin()) {
      const idAdmin = this.authService.getIdAdmin();
      this.esperandoPago = true;

      // Creo preferencia y redirigo al POINT de MP
      this.mercadoPagoService.crearPreferencia(idAdmin).subscribe({
        next: (response) => {
          console.log("Preferencia creada: " + response.initPoint);

          // REDIRECCION
          window.location.href = response.initPoint;
          this.errorPago = '';
        },
        error: (error) => {
          console.log("Error al crear preferencia: " + error.message);
          this.errorPago = "Error al crear pago.";
        }
      });
    }
  };

  logout() {
    this.authService.logout();
    this.router.navigate(['login'])
  }
}
