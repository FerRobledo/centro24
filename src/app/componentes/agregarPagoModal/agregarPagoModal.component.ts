import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import * as _moment from 'moment';
const moment = _moment;

@Component({
  selector: 'app-agregarPagoModal',
  templateUrl: './agregarPagoModal.component.html',
  styleUrls: ['./agregarPagoModal.component.css']
})
export class AgregarPagoModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AgregarPagoModalComponent>,
    private fb: FormBuilder,
    private authService: AuthService,
    private clientesService: ClientesService,
    private router: Router,
    @Inject(DIALOG_DATA) public clientes: any[] = []
  ) { }

  pagoForm!: FormGroup;
  error: string = "";
  cantidadMeses: number = 0;
  monto: number = 0;
  @Output() iniciarCarga = new EventEmitter<void>();

  ngOnInit() {
    this.pagoForm = this.fb.group(
      {
        client: [null ,[Validators.required]],
        fechaDesde: ['', [Validators.required]],
        fechaHasta: [''],
      },
      {
        validators: this.validarFechas
      }
    );
  }

  validarFechas(form: AbstractControl): ValidationErrors | null {
    const desde = form.get('fechaDesde')?.value;
    const hasta = form.get('fechaHasta')?.value;

    if (!desde || !hasta) return null;

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    return fechaDesde <= fechaHasta ? null : { fechasInvalidas: true };
  }

  formatearMesAnio(fecha: Date) {
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${mes}-${anio}`;
  }

  crearPago() {
    if (this.pagoForm.invalid) {
      this.error = "Formulario inválido";
      return;
    }

    // Si usás Moment, obtené la fecha Date con ._d
    const fechaDesdeDate: Date = this.pagoForm.value.fechaDesde._d || this.pagoForm.value.fechaDesde;
    const fechaHastaDate: Date = this.pagoForm.value.fechaHasta._d || this.pagoForm.value.fechaHasta;

    // Formatear fechas
    const fechaDesdeStr = this.formatearMesAnio(fechaDesdeDate);
    const fechaHastaStr = this.formatearMesAnio(fechaHastaDate);

    // Armá el objeto a enviar con fechas formateadas
    const pagoData = {
      ...this.pagoForm.value,
      fechaDesde: fechaDesdeStr,
      fechaHasta: fechaHastaStr,
      monto: this.monto,
    };

    console.log('Pago a enviar:', pagoData);
    return;
    const adminId = this.authService.getIdAdmin();

    this.clientesService.asignarPago(adminId, pagoData).subscribe({
      error: (error: any) => console.log(error),
    });

    this.dialogRef.close({ evento: 'pagoCreado', data: pagoData });
  }


  chosenMonthHandler(normalizedMonth: _moment.Moment, controlName: string, datepicker: any) {
    const ctrl = this.pagoForm.get(controlName);
    const currentValue = ctrl?.value ? moment(ctrl.value) : moment();
    currentValue.month(normalizedMonth.month()).year(normalizedMonth.year());
    ctrl?.setValue(currentValue);
    this.actualizarCantidadMeses();
    datepicker.close();
  }

  chosenYearHandler(event: any, controlName: string) {
    const ctrl = this.pagoForm.get(controlName);
    if (event.value) {
      const date = moment(event.value).startOf('month');
      ctrl?.setValue(date);
    }
  }

  actualizarCantidadMeses() {
    const desde = this.pagoForm.get('fechaDesde')?.value;
    const hasta = this.pagoForm.get('fechaHasta')?.value;

    if (desde && hasta) {
      const fechaDesde = moment(desde);
      const fechaHasta = moment(hasta);

      const diferenciaMeses = fechaHasta.diff(fechaDesde, 'months', true); // incluye decimales
      this.cantidadMeses = Math.floor(diferenciaMeses) + 1; // +1 para incluir ambos meses
    } else if(desde && !hasta){
      this.cantidadMeses = 1;
    } else {
      this.cantidadMeses = 0;
    }
    this.actualizarMonto();
  }


  actualizarMonto() {
    const client = this.pagoForm.value.client;
    if(client){
      this.monto = client.monto * this.cantidadMeses;
    }
  }
  
  get valorMensual(){
    const client = this.pagoForm.value.client;
    if(client){
      return this.pagoForm.value.client.monto;
    }

    else return 0;
  }
}
