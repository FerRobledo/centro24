import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';

registerLocaleData(localeEsAR);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
