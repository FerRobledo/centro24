import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CobranzaService {
private origin = window.location.origin;

constructor(private http: HttpClient) { }

  public getClientsOfDay(id: number): Observable<any>{
    return this.http.get(this.origin + '/api/cobranza/' + id)
  } 

  public postClientDaily(payload: any, idAdmin: number): Observable<any>{
    return this.http.post(this.origin + '/api/cobranza/' + idAdmin, payload);
  }
}
