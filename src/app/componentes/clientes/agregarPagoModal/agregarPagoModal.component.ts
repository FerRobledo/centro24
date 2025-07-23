import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { setMonth, setYear, parseISO, format, differenceInMonths, startOfMonth } from 'date-fns';

const fechaFormateada = format(new Date(), 'MM/yyyy');

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
    @Inject(DIALOG_DATA) public data: any,
  ) { }

  pagoForm!: FormGroup;
  error: string = "";
  cantidadMeses: number = 0;
  monto: number = 0;
  clientsOfMonts: any[] = [];
  @Output() iniciarCarga = new EventEmitter<void>();
  cliente: any = null;
  controlCliente!: FormControl<any>;

  ngOnInit() {
    // Verificás si viene `client` y lo asignás
    if (this.data?.client) {
      this.cliente = this.data.client;
    }

    // Asignás los clientes (por si los necesitás en un select, por ejemplo)
    if (this.data?.clients) {
      this.clientsOfMonts = this.data.clients;
    }

    this.pagoForm = this.fb.group(
      {
        client: [this.cliente, [Validators.required]],
        fechaDesde: ['', [Validators.required]],
        fechaHasta: [''],
      },
      {
        validators: this.validarFechas
      }
    );

    this.pagoForm.get('client')?.valueChanges.subscribe(cliente => {
      this.actualizarMonto(cliente);
    });

    this.controlCliente = this.pagoForm.get('client') as FormControl<any>;
  }


  validarFechas(form: AbstractControl): ValidationErrors | null {
    const desde = form.get('fechaDesde')?.value;
    const hasta = form.get('fechaHasta')?.value;

    if (!desde || !hasta) return null;

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    return fechaDesde <= fechaHasta ? null : { fechasInvalidas: true };
  }

  formatearMesAnio(fecha: Date | string) {
    const fechaObj = (fecha instanceof Date) ? fecha : new Date(fecha);
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObj.getFullYear();
    return `${anio}-${mes}-1`;
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
    let fechaHastaStr = fechaDesdeStr;
    if (fechaHastaDate) {
      fechaHastaStr = this.formatearMesAnio(fechaHastaDate);
    }

    // Armá el objeto a enviar con fechas formateadas
    const pagoData = {
      ...this.pagoForm.value,
      fechaDesde: fechaDesdeStr,
      fechaHasta: fechaHastaStr,
      monto: this.monto,
    };

    const adminId = this.authService.getIdAdmin();

    this.clientesService.asignarPago(adminId, pagoData).subscribe({
      error: (error: any) => console.log(error),
    });

    this.dialogRef.close({ evento: 'pagoCreado', data: pagoData });
  }

  chosenMonthHandler(normalizedMonth: Date, controlName: string, datepicker: any) {
    const ctrl = this.pagoForm.get(controlName);
    const currentValue = ctrl?.value ? parseISO(ctrl.value) : new Date();
    const updated = setMonth(setYear(currentValue, normalizedMonth.getFullYear()), normalizedMonth.getMonth());
    ctrl?.setValue(updated.toISOString());
    this.actualizarCantidadMeses();
    datepicker.close();
  }

  chosenYearHandler(event: any, controlName: string) {
    const ctrl = this.pagoForm.get(controlName);
    if (event.value) {
      const start = startOfMonth(new Date(event.value));
      ctrl?.setValue(start.toISOString());
    }
  }

  actualizarCantidadMeses() {
    const desde = this.pagoForm.get('fechaDesde')?.value;
    const hasta = this.pagoForm.get('fechaHasta')?.value;

    if (desde && hasta) {
      const fechaDesde = parseISO(desde);
      const fechaHasta = parseISO(hasta);

      const diferenciaMeses = differenceInMonths(fechaHasta, fechaDesde);
      this.cantidadMeses = diferenciaMeses + 1; // incluir ambos meses
    } else if (desde && !hasta) {
      this.cantidadMeses = 1;
    } else {
      this.cantidadMeses = 0;
    }

    this.actualizarMonto(this.pagoForm.get('client')?.value);
  }


  actualizarMonto(client: any) {
    if (client) {
      this.monto = client.monto * this.cantidadMeses;
    } else {
      this.monto = 0; // o el valor que corresponda si no hay cliente
    }
  }

  get valorMensual() {
    const client = this.pagoForm.value.client;
    if (client) {
      return this.pagoForm.value.client.monto;
    }

    else return 0;
  }

  onClienteSeleccionado(cliente: any) {
    this.pagoForm.get('client')?.setValue(cliente);
  }
}
