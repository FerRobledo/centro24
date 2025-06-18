import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SheetsService {
  private apiKey = 'AIzaSyBqeAe18AjXjdBmqDu9ighRZV-MGPXs-_k';
  private sheetId = '1iu-qsCOJ9FsHdajPlHr06FjFyfwsotRfRX2dtGFWit8';

  private hojasSubject = new ReplaySubject<string[]>(1);
  hojas$ = this.hojasSubject.asObservable();

  constructor(private http: HttpClient) { }

  cargarHojas(): void {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}?key=${this.apiKey}`;
    this.http.get<any>(url).pipe(
      tap(response => {
        const hojas = response.sheets.map((sheet: any) => sheet.properties.title);
        this.hojasSubject.next(hojas);
      })
    ).subscribe();

  }


  getData(hoja: string): Observable<any[]> {
    const range = `${hoja}!B:D`;
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodedRange}?key=${this.apiKey}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        const valores = response.values || [];
        // Filtrar filas que tengan al menos 3 columnas completas (no vacías)
        return valores.filter((fila: any[]) =>
          fila.length >= 3 &&
          fila.slice(0, 3).every(campo => campo && campo.toString().trim() !== '')
        );
      })
    );
  }

}
