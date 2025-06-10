import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/assets/dto/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http: HttpClient) { }

  private origin = window.location.origin;

  getUsuarios(id: number): Observable<any> {
    return this.http.get<any>(`${this.origin}/api/usuario/${id}`);
  }

  editUsuario(usuario:Usuario): Observable<any>{
    return this.http.put<any>(`${this.origin}/api/usuario/${usuario.id}`, [usuario]);
  }

  eliminarUsuario(usuario: Usuario): Observable<any>{
    return this.http.delete<any>(`${this.origin}/api/usuario/${usuario.id}`);
  }
}
