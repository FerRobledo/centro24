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

  getUsuarios(id: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.origin + '/api/usuario');
  }
}
