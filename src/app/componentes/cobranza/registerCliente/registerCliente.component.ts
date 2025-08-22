import { Component, OnInit, EventEmitter, Output, Input, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from '../../../services/cobranza.service';
import { CobranzaComponent } from '../cobranza.component';
import { OnChanges, SimpleChanges } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';


@Component({
  selector: 'app-registerCliente',
  templateUrl: './registerCliente.component.html',
  styleUrls: ['./registerCliente.component.css']
})
export class RegisterClienteComponent implements OnInit {
  //emite eventos
  @Output() loadClientes = new EventEmitter<void>();
  @Input() clientEdit: any;
  accion: string = '';
  //editMode = false;
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RegisterClienteComponent>,
    private fb: FormBuilder,
    private cobranzaService: CobranzaService,
    private authService: AuthService,
    @Inject(DIALOG_DATA) public data: any,
  ) {
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const camposNumericos: string[] = [
      'efectivo', 'debito', 'credito', 'transferencia', 'cheque', 'gasto'
    ];

    camposNumericos.forEach((campo: string) => {
      const control = this.form.get(campo);
      if (control?.value === null) { //si mi campo coincide con el string, pregunto si es null y si lo es seteo (0)
        control?.setValue(0);
      }
    });

    const payload = this.form.value;
    const idAdmin = this.authService.getIdAdmin();

    if (this.accion == 'editar' && this.data.client?.id) {//si client existe, entonces dame su id_client
      this.cobranzaService.updateClient(this.data.client.id, idAdmin, payload).subscribe({
        error: (err) => {
          console.error('Error al actualizar:', err);
        },
        complete: () => {
          this.dialogRef.close("submit"); //cierro modal
        }
      });
      } else {
      this.cobranzaService.postClientDaily(payload, idAdmin).subscribe({
        error: (err) => {
          console.error('Error al registrar:', err);
        },
        complete: () => {
          this.dialogRef.close("submit");
        }
      });
      this.dialogRef.close("submit"); //cierro modal
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      detalle: ['', Validators.required],
      efectivo: [],
      debito: [],
      credito: [],
      transferencia: [],
      cheque: [],
      observacion: [''],
      gasto: [],
    });
    this.accion = this.data.accion;
    
    if (this.data.client) {
      this.form.setValue({
        detalle: this.data.client.detalle,
        efectivo: this.data.client.efectivo,
        debito: this.data.client.debito,
        credito: this.data.client.credito,
        transferencia: this.data.client.transferencia,
        cheque: this.data.client.cheque,
        observacion: this.data.client.observacion,
        gasto: this.data.client.gasto,
      })
    }
  }

  onCancel() {
    this.dialogRef.close("cerrado");
  }

  asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }
}
