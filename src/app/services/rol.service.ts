import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RolService {

constructor() { }


  getRoles(){
    return ["Cobranza", "Clientes", "Productos"]
  }
}
