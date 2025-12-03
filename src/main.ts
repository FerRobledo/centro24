import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/auth/auth.interceptor';

import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localeEsAR from '@angular/common/locales/es-AR';

// Registro del locale
registerLocaleData(localeEsAR);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // ⭐️ ESTE ES EL QUE FALTABA
    { provide: LOCALE_ID, useValue: 'es-AR' }
  ]
})
.catch(err => console.error(err));
