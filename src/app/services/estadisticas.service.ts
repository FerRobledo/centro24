import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, from, map, mergeMap, Observable, of, toArray } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})

export class EstadisticasService {
    private origin = window.location.origin;

    constructor(private http: HttpClient, private authService: AuthService) { }

    public getStatsPreviousMonth(id: number): Observable<any> {
        return this.http.get(this.origin + '/api/estadisticas/' + id + '?action=previous');
    }

    public getStatsCurrenMonth(id: number): Observable<any> {
        return this.http.get(this.origin + '/api/estadisticas/' + id + '?action=current');
    }

    public getClients(id: number): Observable<any> {
        return this.http.get(this.origin + '/api/estadisticas/' + id + '?action=clients');
    }

    public getNewClients(id: number): Observable<any> {
        return this.http.get(this.origin + '/api/estadisticas/' + id + '?action=newClients');
    }

    public getUsersByAdmin(id: number): Observable<any> {
        return this.http.get(this.origin + '/api/estadisticas/' + id + '?action=users');
    }

    public getCollectionYesterday(id: number): Observable<any> {
        return this.http.get(this.origin + '/api/estadisticas/' + id + '?action=yesterday');
    }

}
