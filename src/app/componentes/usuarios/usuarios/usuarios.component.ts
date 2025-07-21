import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { MatTableDataSource } from '@angular/material/table';
import { Usuario } from 'src/assets/dto/usuario';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioModalComponent } from '../usuarioModal/UsuarioModal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, OnDestroy {

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    console.log("usuarios component");
  }

  private subscriptions: Subscription = new Subscription();
  filtroUsuarios = new MatTableDataSource();
  usuarios: Usuario[] = []
  cargando: Boolean = false;

  ngOnInit() {
    this.cargarUsuarios();
  }
  ngOnDestroy(): void {
    this.dialog.closeAll();
    this.subscriptions.unsubscribe();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.cdr.detectChanges();
    const userId = this.authService.getIdAdmin();
    if (userId) {
      this.subscriptions.add(
        this.usuarioService.getUsuarios(userId).subscribe({
          next: data => {
            this.usuarios = data.usuarios;
          },
          error: error => { console.log(error) },
          complete: () => { this.cargando = false; this.cdr.detectChanges(); },
        })
      );
    }
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroUsuarios.filter = filterValue.trim().toLowerCase();
  }

  nuevoUsuario() {
    const dialogRef = this.dialog.open(UsuarioModalComponent, {
      maxWidth: '100%',
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
