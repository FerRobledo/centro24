import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoMensualService {
  private origin = window.location.origin;

  constructor(private http: HttpClient) { }

  public getPagosMensuales(params: {
    page: number,
    pageSize: number,
    search?: string,
  }): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get(`${this.origin}/api/pagosMensuales`, { params })
  }

  public deletePago(idPago: number): Observable<any> {
    return this.http.delete(`${this.origin}/api/pagosMensuales/${idPago}`);
  }

  public asignarPago(infoPago: any): any {
    return this.http.post(`${this.origin}/api/pagosMensuales`, infoPago)
  }
}
