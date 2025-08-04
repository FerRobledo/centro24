import { Component, OnInit, EventEmitter, Output, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractControl } from '@angular/forms';
import { DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'app-insertarCliente',
  templateUrl: './insertarCliente.component.html',
  styleUrls: ['./insertarCliente.component.css']
})
export class InsertarClienteComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>();
  @Input() clientEdit: any;
  accion: string = '';
  form!: FormGroup;
  client: any = { tipo: '', cliente: '', mensual: ''};
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  formMeses = new FormGroup({});
  cargando: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<InsertarClienteComponent>,
    private fb: FormBuilder,
    private authService: AuthService,
    private clientstService: ClientesService,
    @Inject(DIALOG_DATA) public data: any,
  ) { }

  onSubmit() {
    if (this.form.invalid) {
      console.log("Formulario inválido");
      return;
    }

    //fltra y mapea los meses seleccionados (checked) del formulario formMeses
    const mesesPagados = Object.entries(this.formMeses.value)
      .filter(([mes, checked]) => checked)
      .map(([mes]) => mes);
    //cuando hago sumbit lleno el meses pagados con los true

    const camposNumericos: string[] = [
      'mensual',
    ];

    camposNumericos.forEach((campo: string) => {
      const control = this.form.get(campo);
      if (control?.value === null) {
        control?.setValue(0);
      }
    });

    const payload = {
      ...this.form.value,
      mesesPagados  //aplano el form y agrego el meses pagados todo el payload
    };
    const idAdmin = this.authService.getIdAdmin();
    this.cargando = true;

    if (this.accion == 'editar' && this.data.client?.id_client) {

      this.clientstService.updateClient(this.data.client.id_client, idAdmin, payload).subscribe({
        error: (err) => {
          console.error('Error al actualizar:', err);
        },
        complete: () => {
          //console.log('llega en algun momento aca????');
          this.dialogRef.close("submit"); //cierro modal
          this.cargando = false;
        }
      });
    } else {
      this.clientstService.postClientDaily(payload, idAdmin).subscribe({
        error: (err) => {
          console.error('Error al registrar:', err);
        },
        complete: () => {
          this.dialogRef.close("submit"); //cierro modal
          this.cargando = false;
        }
      });
    }
  }

  ngOnInit() { //setea todos los meses en false
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      cliente: ['', Validators.required],
      mensual: [],
    });
    this.meses.forEach(mes => {
      this.formMeses.addControl(mes, new FormControl(false)); /*const nombre = new FormControl('Matías');
                                                              console.log(nombre.value); // → 'Matías' */

    });
    this.accion = this.data.accion;

    if (this.data.client) {
      this.form.setValue({
        tipo: this.data.client.tipo,
        cliente: this.data.client.cliente,
        mensual: this.data.client.mensual,
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