import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from '../auth/auth.service';
import { Observable } from "rxjs";
import { Log } from "src/assets/dto/log";

@Injectable({
    providedIn: 'root'
})
export class LogsService{
    private origin = window.location.origin;

    constructor(private http: HttpClient, private authService: AuthService) { }

    // Obtener todos los logs
    public getLogs(): Observable<Log[]> {
        const id_admin = this.authService.getIdAdmin();
        return this.http.get<Log[]>(this.origin + '/api/logs/' + id_admin);
    }

    // Crear un nuevo log (para cuando quieras registrar acciones)
    crearLog(log: Log): Observable<Log> {
        const id_admin = this.authService.getIdAdmin();
        return this.http.post<Log>(this.origin + '/api/logs/' + id_admin, log);
    }
}