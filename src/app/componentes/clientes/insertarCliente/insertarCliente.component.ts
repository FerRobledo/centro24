import { Component, OnInit, EventEmitter, Output, Input  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { ClientesComponent } from '../clientes.component';
import { OnChanges, SimpleChanges } from '@angular/core';

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
      semanal: [],
      monto_pagado: []
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      console.log("Formulario inválido");
      return;
    }

    const camposNumericos: string[] = [
      'mensual', 'bonificacion', 'semanal', 'monto_pagado'
    ];

    
    camposNumericos.forEach((campo: string) => {
      const control = this.form.get(campo);
      if (control?.value === null) { 
        control?.setValue(0);
      }
    });

    const payload = this.form.value;
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
  ngOnInit() {
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
        semanal: this.clientEdit.semanal,
        monto_pagado: this.clientEdit.monto_pagado,
      });
    }
  }

}