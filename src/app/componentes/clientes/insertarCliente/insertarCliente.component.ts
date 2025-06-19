import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { ClientesComponent } from '../clientes.component';

@Component({
  selector: 'app-insertarCliente',
  templateUrl: './insertarCliente.component.html',
  styleUrls: ['./insertarCliente.component.css']
})
export class InsertarClienteComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clientstService: ClientesService,
    private clientComponent: ClientesComponent) {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      cliente: ['', Validators.required],
      mensual: [0],
      bonificacion: [0],
      semanal: [0],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      console.log("Formulario inválido");
      return;
    }

    const idAdmin = this.authService.getIdAdmin();
    const payloadInsert = this.form.value;
    
    this.clientstService.postClientMonthly(payloadInsert, idAdmin).subscribe({
      next: (res) => {
        console.log('Éxito:', res);
        this.closeForm.emit();
        this.clientComponent.ngOnInit();
      },
      error: (err) => {
        console.error('Error al enviar:', err);
        if (err.status === 404) {
          console.log('La URL no se encontró');
        } else {
          console.log('Ocurrió un error al registrar el cliente');
        }
      },
      complete: () => {
        console.log("Registro en estado OK");
      }
    })
    /*
        const camposInsertForm: string[] = [
          'tipo',
          'cliente',
          'credito',
          'transferencia',
          'cheque',
          'retiro',
          'gasto'
        ];
    
        camposInsertForm.forEach((campo: string) => {
          const control = this.form.get(campo);
          if (control?.value === null) { 
            control?.setValue(0);
          }
        });
      
    */
  }
  ngOnInit() {
  }

  onCancel() {
    this.closeForm.emit();
  }

}