import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../confirmDialog/confirmDialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MercadopagoService } from 'src/app/services/mercadopago.service';
import { EstadoCuentaService } from 'src/app/services/estadoCuenta.service';

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
    private estadoCuentaService: EstadoCuentaService,
  ) { }

  roles: string[] = []
  nameUserCurrent: String = '';

  advertenciaVisible: boolean = false;
  diasRestantes: any = null;
  esperandoPago: boolean = false;
  errorPago: string = '';

  creandoPreferencia: boolean = false;
  estadoSub: any;

  cuotaMensual = 70000;
  esAdmin = false;


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
    this.esAdmin = this.roles.includes('Admin');
    this.estadoCuentaService.cargarEstadoCuenta();
    this.filtrarSecciones();
    this.nameUserCurrent = this.authService.getUserName();

    this.estadoSub = this.estadoCuentaService.estado$.subscribe(estado => {
      if (!estado) return;

      if (estado.estado !== 'ACTIVO') {
        this.mostrarAdvertencia();
      }

      this.diasRestantes = estado.diasRestantes
    });
  }

  mostrarAdvertencia() {
    this.advertenciaVisible = true;
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

  cerrarAdvertencia() {
    this.advertenciaVisible = false;
    this.errorPago = ''
  }

  redirigirMercadoPago() {
    // Solo los admins pueden realizar pago por MP
    if (this.authService.esAdmin()) {
      const idAdmin = this.authService.getIdAdmin();
      this.creandoPreferencia = true;

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
