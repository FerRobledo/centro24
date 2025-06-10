import { Component, Input, OnInit } from '@angular/core';
import { RolService } from 'src/app/services/rol.service';
import { newUsuario, Usuario } from 'src/assets/dto/usuario';

@Component({
  selector: 'app-usuarioCard',
  templateUrl: './usuarioCard.component.html',
  styleUrls: ['./usuarioCard.component.css']
})
export class UsuarioCardComponent implements OnInit {

  constructor(
    private rolService:RolService,
  ) { }
  // @Input() usuario: Usuario = newUsuario();
  usuario: Usuario = {
    id: 0,
    nombre: 'Clientes',
    roles: ['Clientes'],
  }
  roles: string[] = [];

  ngOnInit() {
    this.roles = this.rolService.getRoles();
  }

  onTogglePermiso(rol: string){

  }
}
