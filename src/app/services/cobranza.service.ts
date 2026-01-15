import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CobranzaService {
  private origin = window.location.origin;

  constructor(private http: HttpClient) { }

  public getClientsOfDay(): Observable<any> {
    return this.http.get(`${this.origin}/api/cobranza`)
  }

  public cerrarCaja(nameUser: string): Observable<any> {
    return this.http.post( `${this.origin}/api/cobranza/cerrarCaja/?nameUser=${nameUser}`, {});
  }

  public getCierreCaja(): Observable<any>{
    return this.http.get(`${this.origin}/api/cobranza/cerrarCaja`);
  }

  public getClientsByDate(idAdmin: number, date: string): Observable<any> {
    return this.http.get(`${this.origin}/api/cobranza/${idAdmin}/ventasPorDia?date=${date}`)
  }

  public getHistorialByDate(idAdmin: number, date: string): Observable<any> {
    return this.http.get(`${this.origin}/api/cobranza/${idAdmin}/historialCierrePorDia?date=${date}`)
  }

  public postClientDaily(payload: any): Observable<any> {
    return this.http.post(`${this.origin}/api/cobranza`, payload);
  }

  public updateClient(idClient: number, payload: any) {
    const body = { ...payload, idClient };
    return this.http.put(`${this.origin}/api/cobranza`, body);
  }

  public deleteClient(idClient: number) {
    const body = { idClient };
    return this.http.delete(`${this.origin}/api/cobranza`, { body });
  }

  public getHistory(id: number): Observable<any> {
    return this.http.get( `${this.origin}/api/cobranza/${id}/historialCierres`)
  }

  public getDetailsId(id: number, idCierre: number): Observable<any> {
    return this.http.get( `${this.origin}/api/cobranza/${id}/detallesCierre/?idCierre= ` + idCierre)
  }
}
