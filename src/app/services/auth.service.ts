import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Rol } from 'src/assets/dto/rol';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private origin = window.location.origin;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.origin}/api/login`, { username, password });
  }

  register(username: string, password: string, rolesUsuario: Rol[], idPadre: number = -1): Observable<any> {
    return this.http.post(`${this.origin}/api/register`, { username, password, rolesUsuario, idPadre });
  }

  storeToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
  }

  validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return Promise.resolve(false);

    return this.http
      .get('/api/login', {
        headers: { Authorization: `Bearer ${token}` },
        params: { action: 'validarToken' }
      })
      .toPromise()
      .then(() => true)
      .catch(() => false);
  }

  getUserId() {
    const token = this.getToken();

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || null;
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }

  }

  getIdAdmin() {
    const token = this.getToken();

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      let idAdmin = payload.idAdmin;
      if (!idAdmin) {
        return this.getUserId();
      } else {
        return payload.idAdmin;
      }
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }

  }

  getUserRoles() {
    const token = this.getToken();

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      let roles = payload.roles;
      return roles || null;
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  }

  esAdmin(): boolean {
    const token = this.getToken();

    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      let idAdmin = payload.idAdmin;
      if (!idAdmin) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return false;
    }
  }

  getUserName() {
    const token = this.getToken();

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const username = payload.username;
      //console.log("el objeto es", payload);
      //console.log("el nombre del cliente es: " + username);

      return username || null;
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }

  }
}
