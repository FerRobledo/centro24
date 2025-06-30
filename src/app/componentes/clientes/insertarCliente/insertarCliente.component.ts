import { Component, OnInit, EventEmitter, Output, Input  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { ClientesComponent } from '../clientes.component';
import { OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-insertarCliente',
  templateUrl: './insertarCliente.component.html',
  styleUrls: ['./insertarCliente.component.css']
})
export class InsertarClienteComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>();
  @Input() clientEdit: any;
  
  form: FormGroup;
  editMode = false;
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio','Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  formMeses = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clientstService: ClientesService,
    private clientComponent: ClientesComponent) {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      cliente: ['', Validators.required],
      mensual: [],
      bonificacion: [],
      monto: []
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      console.log("Formulario inválido");
      return;
    }

    //fltra y mapea los meses seleccionados (checked) del formulario formMeses
    const mesesPagados = Object.entries(this.formMeses.value)
    .filter(([mes, checked]) => checked)
    .map(([mes]) => mes); 
    console.log('Meses pagados:', mesesPagados);
    //cuando hago sumbit lleno el meses pagados con los true

    const camposNumericos: string[] = [
      'mensual', 'bonificacion', 'monto'
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

    if (this.editMode && this.clientEdit?.id_client) { //existe un cliente para editar y tiene un ID definido??

      this.clientstService.updateClient(this.clientEdit.id_client, idAdmin, payload).subscribe({
        next: (res) => {
          console.log('Cliente actualizado:', res);
          this.closeForm.emit();
          this.form.reset();
          console.log("el cliente que se edito fue: ", this.clientEdit);
          this.clientComponent.ngOnInit();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
        }
      });
    } else {
      this.clientstService.postClientDaily(payload, idAdmin).subscribe({
        next: (res) => {
          console.log('Cliente registrado:', res);
          this.closeForm.emit();
          this.clientComponent.ngOnInit();          
        },
        error: (err) => {
          console.error('Error al registrar:', err);
        }
      });
    }
  }
  ngOnInit() { //setea todos los meses en false
    this.meses.forEach(mes => {
      this.formMeses.addControl(mes, new FormControl(false)); /*const nombre = new FormControl('Matías');
                                                              console.log(nombre.value); // → 'Matías' */
    });
  }

  onCancel() {
    this.closeForm.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientEdit'] && this.clientEdit) {
      this.editMode = true;
      this.form.patchValue({
        tipo: this.clientEdit.tipo ?? '',
        cliente: this.clientEdit.cliente,
        mensual: this.clientEdit.mensual,
        bonificaion: this.clientEdit.bonificaion,
        monto: this.clientEdit.monto,
      });
    }
  }

  asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }
}