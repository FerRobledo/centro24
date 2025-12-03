import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoMensualService {
  private origin = window.location.origin;

  constructor(private http: HttpClient) { }

  public getPagosMensuales(idAdmin: number): Observable<any> {
    return this.http.get(this.origin + '/api/pagosMensuales/' + idAdmin)
  }

  public deletePago(idAdmin: number, idPago: number): Observable<any> {
    return this.http.delete(this.origin + '/api/pagosMensuales/' + idAdmin + "/" + idPago);
  }

  public asignarPago(idAdmin: number, infoPago: any): any {
    return this.http.post(this.origin + '/api/pagosMensuales/' + idAdmin, infoPago)
  }
}
