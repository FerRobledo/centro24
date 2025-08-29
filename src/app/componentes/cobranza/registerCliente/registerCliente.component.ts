import { Component, OnInit, EventEmitter, Output, Input, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from '../../../services/cobranza.service';
import { MatDialogRef } from '@angular/material/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';

// Tipos disponibles de pago, tendria que venir desde api
const tiposDePagos: string[] = [
  'Efectivo', 'Debito', 'Credito', 'Transferencia', 'Cheque'
]


@Component({
  selector: 'app-registerCliente',
  templateUrl: './registerCliente.component.html',
  styleUrls: ['./registerCliente.component.css']
})
export class RegisterClienteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RegisterClienteComponent>,
    private fb: FormBuilder,
    private cobranzaService: CobranzaService,
    private authService: AuthService,
    @Inject(DIALOG_DATA) public data: any,
  ) {
  }

  //emite eventos
  @Output() loadClientes = new EventEmitter<void>();

  @Input() clientEdit: any;

  accion: string = '';
  esGasto: boolean = false;
  pagoSeleccionado: string | null = null;
  pagos: { tipo: string, monto: number }[] = [];
  observacion: string = '';
  detalle: string = '';

  agregarVenta() {
    
    const payload = { detalle: this.detalle, observacion: this.observacion, pagos: this.pagos };
    const idAdmin = this.authService.getIdAdmin();
    
    console.log(payload);
    this.cobranzaService.postClientDaily(payload, idAdmin).subscribe({
      error: (err) => {
        console.error('Error al registrar:', err);
      },
      complete: () => {
        this.dialogRef.close("submit");
      }
    });    
    this.loadClientes.emit;
    this.dialogRef.close("submit"); //cierro modal
  }

  ngOnInit() {
    if(this.data && this.data.accion){
      this.accion = this.data.accion;
      
      if(this.accion == 'gasto'){
        this.pagos.push({ tipo:'Gasto', monto: 0 });
      }
    }
  }

  onCancel() {
    this.dialogRef.close("cerrado");
  }

  asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  agregarPago() {
    if (this.pagoSeleccionado) {
      this.pagos.push({ tipo: this.pagoSeleccionado, monto: 0 });
    }

    setTimeout(() => {
      this.pagoSeleccionado = null;
    });
  }

  get tiposDePagoSeleccionables(): string[] {
    return tiposDePagos.filter(
      tipo => !this.pagos.some(p => p.tipo === tipo)
    );
  }

  get montoTotal(): number {
    return this.pagos.reduce((total, pago) => total + pago.monto, 0);
  }

  onDeleteSelector(index: number) {
    this.pagos.splice(index, 1);
  }

  actualizarMonto(index: number, event: any) {
    this.pagos[index].monto = event;
  }
}
