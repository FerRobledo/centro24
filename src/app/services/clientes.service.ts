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

  public getClientsOfMonth(
    params: {
      page: number,
      pageSize: number,
      search?: string,
      selectedFiltroPago?: string,
    }
  ): Observable<any> {

    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.selectedFiltroPago) httpParams = httpParams.set('filtroPago', params.selectedFiltroPago);

    return this.http.get(`${this.origin}/api/clientes`, { params })
  }

  public postClientDaily(payload: any): Observable<any> {
    return this.http.post(`${this.origin}/api/clientes`, payload);
  }

  public deleteClient(idClient: number) {
    return this.http.delete(`${this.origin}/api/clientes/${idClient}`);
  }

  public updateClient(idClient: number, payload: any) {
    const body = { ...payload };
    return this.http.put(`${this.origin}/api/clientes/${idClient}`, body);
  }

  public incrementClient(porcentaje: number): Observable<any> {
    return this.http.put(`${this.origin}/api/clientes/aumentarPrecio`, { porcentaje: porcentaje });
  }

}
