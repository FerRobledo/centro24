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
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (isTokenExpired(token)) {
    router.navigate(['/login']);
    return false;
  }

  const userRoles = authService.getUserRoles().map((r: string) => r.toLowerCase()); // roles del usuario en minúsculas
  const rolRequerido = state.url.slice(1).toLowerCase(); // ruta sin "/" y en minúsculas

  // Permitimos siempre acceso a Home o ruta raíz
  if (rolRequerido === '' || rolRequerido === 'home') {
    return true;
  }

  // Si el usuario tiene rol 'admin', permitimos todo
  if (userRoles.includes('admin')) {
    return true;
  }

  if (!userRoles.includes(rolRequerido)) {
    router.navigate(['/']); // o donde quieras redirigir si no tiene permiso
    return false;
  }

  return true;
};
