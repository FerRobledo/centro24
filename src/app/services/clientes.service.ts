import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
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
    const body = { ...payload, idClient };
    return this.http.put(this.origin + '/api/clientes/' + idAdmin, body);
  }

  public asignarPago(idAdmin: number, infoPago: any): any{
    const data = {infoPago, accion:'addPago'}
    return this.http.post(this.origin + '/api/clientes/' + idAdmin, data)
  }

  public incrementClient(idAdmin: number, porcentaje: number): Observable<any> {
    const body = { porcentaje, accion:'incrementar' }; 
    return this.http.put(this.origin + '/api/clientes/' + idAdmin, body);
  }
  
  // Movido a pagoMensual.service 
  // Eliminta action: 'deletePago', la accion pasa a ser el metodo HTTP (this.http.delete());

  // public deletePago(idAdmin: number, id: number): Observable<any>{
  //   const body = {action:'deletePago', id};
  //   return this.http.delete(this.origin + '/api/clientes/' + idAdmin, { body });
  // }
}
