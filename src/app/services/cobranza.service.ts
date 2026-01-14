import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CobranzaService {
  private origin = window.location.origin;

  constructor(private http: HttpClient) { }

  public getClientsOfDay(id: number): Observable<any> {
    return this.http.get(this.origin + '/api/cobranza/' + id)
  }

  public closeClientsOfDay(id: number, nameUser: string): Observable<any> {
    return this.http.post( `${this.origin}/api/cobranza/${id}/cerrarCaja/?nameUser=${nameUser}`, {});
  }

  public getClientsByDate(idAdmin: number, date: string): Observable<any> {
    return this.http.get(`${this.origin}/api/cobranza/${idAdmin}/ventasPorDia?date=${date}`)
  }

  public getHistorialByDate(idAdmin: number, date: string): Observable<any> {
    return this.http.get(`${this.origin}/api/cobranza/${idAdmin}/historialCierrePorDia?date=${date}`)
  }

  public postClientDaily(payload: any, idAdmin: number): Observable<any> {
    return this.http.post(this.origin + '/api/cobranza/' + idAdmin, payload);
  }

  public updateClient(idClient: number, idAdmin: number, payload: any) {
    const body = { ...payload, idAdmin };
    return this.http.put(this.origin + '/api/cobranza/' + idClient, body);
  }

  public deleteClient(idAdmin: number, idClient: number) {
    const body = { idClient };
    return this.http.delete(this.origin + '/api/cobranza/' + idAdmin, { body });
  }

  public getHistory(id: number): Observable<any> {
    return this.http.get( `${this.origin}/api/cobranza/${id}/historialCierres`)
  }

  public getDetailsId(id: number, idCierre: number): Observable<any> {
    return this.http.get( `${this.origin}/api/cobranza/${id}/detallesCierre/?idCierre= ` + idCierre)
  }
}
