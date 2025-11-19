import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../componentes/dashboard/dashboard.component';
import { InformacionComponent } from '../componentes/informacion/informacion.component';
import { UsuarioCardComponent } from '../componentes/usuarios/usuarioCard/usuarioCard.component';
import { UsuarioModalComponent } from '../componentes/usuarios/usuarioModal/UsuarioModal.component';
import { UsuariosComponent } from '../componentes/usuarios/usuarios/usuarios.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardRoutes } from './dashboard.routing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule, MatNativeDateModule, NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkNoDataRow } from "@angular/cdk/table";


export const MONTH_YEAR_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    DashboardComponent,
    InformacionComponent,
    UsuariosComponent,
    UsuarioModalComponent,
    UsuarioCardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutes,
    ReactiveFormsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDividerModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    CdkNoDataRow
],
  providers: [
    provideAnimationsAsync(),
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_YEAR_FORMATS },
  ],
})
export class DashboardModule { }


