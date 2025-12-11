import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MercadopagoService {

  constructor(private http: HttpClient) { }

  crearPreferencia(userId: number) {
    return this.http.post<{ initPoint: string }>('/api/mercadopago/crear-preferencia', {
      userId: userId,
    });
  }
}
