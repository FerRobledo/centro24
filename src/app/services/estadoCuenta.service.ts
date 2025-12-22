import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { HttpClient } from '@angular/common/http'

export interface EstadoCuenta {
    estado: 'ACTIVO' | 'POR_VENCER' | 'VENCIDO'
    diasRestantes: number
    esAdmin: boolean
}

@Injectable({
    providedIn: 'root'
})
export class EstadoCuentaService {

    private estadoSubject = new BehaviorSubject<EstadoCuenta | null>(null)

    estado$ = this.estadoSubject.asObservable()

    private origin = window.location.origin;

    constructor(private http: HttpClient) { }

    cargarEstadoCuenta() {
        this.http.get<EstadoCuenta>(this.origin + '/api/estadoCuenta')
            .subscribe(estado => {
                this.estadoSubject.next(estado)
            })
    }
}
