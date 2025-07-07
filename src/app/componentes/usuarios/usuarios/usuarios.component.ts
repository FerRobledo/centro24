import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { MatTableDataSource } from '@angular/material/table';
import { Usuario } from 'src/assets/dto/usuario';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioModalComponent } from '../usuarioModal/UsuarioModal.component';

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
  ) { 
    console.log("usuarios component");
  }

  filtroUsuarios = new MatTableDataSource();
  usuarios: Usuario[] = []
  cargando: Boolean = false;

  ngOnInit() {
    this.cargarUsuarios();
  }
  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  cargarUsuarios() {
    this.cargando = true;
    const userId = this.authService.getIdAdmin();
    if (userId) {
      this.usuarioService.getUsuarios(userId).subscribe({
        next: data => {
          this.usuarios = data.usuarios;
        },
        error: error => { console.log(error) },
        complete: () => { this.cargando = false },
      })
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
