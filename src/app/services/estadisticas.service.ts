import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class EstadisticasService {
    private origin = window.location.origin;

    constructor(private http: HttpClient) { }

    public getStats(id: number): Observable<any> {
        return this.http.get(this.origin + '/api/estadisticas/' + id);
    }

}
