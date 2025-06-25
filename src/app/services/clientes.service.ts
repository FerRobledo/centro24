import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private origin = window.location.origin;

  constructor(private http: HttpClient) { }

  public getClientsOfMonth(idAdmin: number): Observable<any> {
    return this.http.get(this.origin + '/api/clientes/' + idAdmin)
  }

  public postClientDaily(payload: any, idAdmin: number): Observable<any> {
    return this.http.post(this.origin + '/api/clientes/' + idAdmin, payload);
  }

  public deleteClient(idAdmin: number, idClient: number) {
    const body = { idClient };
    return this.http.delete(this.origin + '/api/clientes/' + idAdmin, { body });
  }

  public updateClient(idClient: number, idAdmin: number, payload: any) {
    const body = { ...payload, idAdmin };
  
    return this.http.put(this.origin + '/api/clientes/' + idClient, body);
  }
}
