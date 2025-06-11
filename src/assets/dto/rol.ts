export interface Rol {
    id: number;
    nombre: string;
}

export function newRol(): Rol{
    return {
    id: 0,
    nombre: '',
  }
}