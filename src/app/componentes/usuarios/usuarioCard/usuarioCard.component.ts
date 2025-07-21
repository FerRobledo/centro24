import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { RolService } from 'src/app/services/rol.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Rol } from 'src/assets/dto/rol';
import { newUsuario, Usuario } from 'src/assets/dto/usuario';

@Component({
  selector: 'app-usuarioCard',
  templateUrl: './usuarioCard.component.html',
  styleUrls: ['./usuarioCard.component.css']
})
export class UsuarioCardComponent implements OnInit {

  constructor(
    private rolService: RolService,
    private userService: UsuarioService,
    private cdr: ChangeDetectorRef,
  ) { }

  @Input() usuario: Usuario = newUsuario();
  roles: Rol[] = [];
  cargandoCardUsuario: boolean = false;

  ngOnInit() {
    this.roles = this.rolService.getRoles();
  }

  onTogglePermiso(rol: Rol, event: boolean) {
    this.cargandoCardUsuario = true;
    this.cdr.detectChanges();
    if (event) {
      const yaTieneRol = this.usuario.roles.some(r => r.id === rol.id);
      if (!yaTieneRol) {
        this.usuario.roles.push(rol);
      }
    } else {
      this.usuario.roles = this.usuario.roles.filter(r => r.id !== rol.id);
    }
    
    this.userService.editUsuario(this.usuario).subscribe({
      error: error => console.log(error),
      complete: () => this.cargandoCardUsuario = false,
    });
    this.cdr.detectChanges();
  }

  esRolAsignado(rol: Rol): boolean {
    return this.usuario.roles.some(r => r.id === rol.id);
  }

  eliminarUsuario(){
    this.cargandoCardUsuario = true;
    this.userService.eliminarUsuario(this.usuario).subscribe({
      next: () => location.reload(),
      error: error => console.log(error),
    });
  }
}
