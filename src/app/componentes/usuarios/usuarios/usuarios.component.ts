import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { MatTableDataSource } from '@angular/material/table';
import { Usuario } from 'src/assets/dto/usuario';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioModalComponent } from '../usuarioModal/UsuarioModal.component';
import { Subscription } from 'rxjs';
import {ReactiveFormsModule } from '@angular/forms';
import { UsuarioCardComponent } from '../usuarioCard/usuarioCard.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports:[ReactiveFormsModule, UsuarioCardComponent, CommonModule],//todos los import que uso en html
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
    ;
    const userId = this.authService.getIdAdmin();
    if (userId) {
      this.subscriptions.add(
        this.usuarioService.getUsuarios(userId).subscribe({
          next: data => {
            this.usuarios = data.usuarios;
          },
          error: error => { console.log(error) },
          complete: () => { this.cargando = false; ; },
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
