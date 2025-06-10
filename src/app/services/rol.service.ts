import { Injectable } from '@angular/core';
import { Rol } from 'src/assets/dto/rol';

@Injectable({
  providedIn: 'root'
})
export class RolService {

constructor() { }


  getRoles(): Rol[]{
    return [{id: 1, nombre: "Cobranza"}, {id: 2, nombre: "Clientes"}, {id: 3, nombre: "Productos"}]
  }
}
