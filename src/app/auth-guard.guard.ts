import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';


// Función para verificar si el token está vencido
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true; // Si no hay token, lo consideramos expirado

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el payload del JWT
    const expiry = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() > expiry; // Comparar con el tiempo actual
  } catch (error) {
    return true; // Si hay un error en el parsing, lo tratamos como expirado
  }
};

// Usamos `inject` para obtener las dependencias de AuthService y Router
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Validación local: si no hay token o expiró
  if (isTokenExpired(token)) {
    router.navigate(['/login']);
    return false;
  }

  // Validación remota contra el backend
  // const isValid = await authService.validateToken();
  // if (!isValid) {
  //   router.navigate(['/login']);
  //   return false;
  // }

  const userRoles = authService.getUserRoles().map((r: string) => r.toLowerCase());
  const rolRequerido = state.url.slice(1).toLowerCase();

  if (rolRequerido === '' || rolRequerido === 'home') return true;
  if (userRoles.includes('admin')) return true;

  if (!userRoles.includes(rolRequerido)) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
