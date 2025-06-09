export interface Usuario {
    id: number;
    nombre: string;
    roles: string[];
}

export function newUsuario(): Usuario{
    return {
    id: 0,
    nombre: '',
    roles: [],
  }
}