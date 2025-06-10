import { Rol } from "./rol";

export interface Usuario {
    id: number;
    nombre: string;
    roles: Rol[];
}

export function newUsuario(): Usuario{
    return {
    id: 0,
    nombre: '',
    roles: [],
  }
}