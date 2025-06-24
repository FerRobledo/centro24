import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private origin = window.location.origin;

  constructor(private http: HttpClient) { }

  public getClientsOfMonth(idAdmin: number): Observable<any>{
    return this.http.get(this.origin + '/api/clientes/' + idAdmin)
  } 
  
  public postClientMonthly(payloadInsert: any, idAdmin: number): Observable<any>{
    return this.http.post(this.origin + '/api/clientes/' + idAdmin, payloadInsert);
  }
  /*
    public getClientsOfDay(id: number): Observable<any>{
      return this.http.get(this.origin + '/api/cobranza/' + id)
    } 
  
    public postClientDaily(payload: any, idAdmin: number): Observable<any>{
      return this.http.post(this.origin + '/api/cobranza/' + idAdmin, payload);
    }
  
    public closeClientsOfDay(idAmin: number): Observable<any>{
      return this.http.get(this.origin + '/api/cobranza/' + idAmin + '?action=close');
    }*/
  }
