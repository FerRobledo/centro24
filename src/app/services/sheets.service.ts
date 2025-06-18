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

  constructor(private http: HttpClient) { }

  getSheetData(range: string, sheet: string = ""): Observable<any> {
    if (sheet == 'config') {
      return this.getData(range, this.configSheetId);
    } else {

      if (!this.sheetId) {
        return this.getSheetProductosId().pipe(
          switchMap(data => {
            this.sheetId = data.values[0][0];
            return this.getData(range, this.sheetId);
          })
        );
      } else {
        return this.getData(range, this.sheetId);
      }
    }
  }

  cargarHojas(): void {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}?key=${this.apiKey}`;
      this.http.get<any>(url).pipe(
        tap(response => {
          const hojas = response.sheets.map((sheet: any) => sheet.properties.title);
          this.hojasSubject.next(hojas);
        })
      ).subscribe();

      console.log(this.hojasSubject)

  }

  getData(range: string, sheetId: string) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${this.apiKey}`;
    return this.http.get<any>(url);
  }

  getSheetProductosId() {
    const range = 'Configuraciones!B4'
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.configSheetId}/values/${range}?key=${this.apiKey}`;
    return this.http.get<any>(url);
  }
}
