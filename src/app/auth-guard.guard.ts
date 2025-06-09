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

  // Verificar si el token está presente
  if (!isTokenExpired(token)) {
    return true; // Permite el acceso a la ruta
  } else {
    router.navigate(['/login']); // Redirige al login si no está autenticado
    return false; // Bloquea el acceso
  }
};
