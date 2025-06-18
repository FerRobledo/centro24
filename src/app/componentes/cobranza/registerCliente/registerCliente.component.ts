import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from '../../../services/cobranza.service';
import { CobranzaComponent } from '../cobranza.component';

@Component({
  selector: 'app-registerCliente',
  templateUrl: './registerCliente.component.html',
  styleUrls: ['./registerCliente.component.css']
})
export class RegisterClienteComponent implements OnInit {
  //emite eventos
  @Output() closeForm = new EventEmitter<void>();

  form: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private cobranzaService: CobranzaService,
    private authService: AuthService,
    private cobranzaComponent: CobranzaComponent 
  ) {
    this.form = this.fb.group({
      detalle: ['', Validators.required],
      efectivo: [],
      debito: [],
      credito: [],
      transferencia: [],
      cheque: [],
      retiro: [],
      observacion: [''],
      gasto: [],
    });
  }
  
  //onCancel cierro el form
  onCancel() {
    this.closeForm.emit();
  }

  onSubmit() {
    if (this.form.invalid) {
      console.log("Formulario inválido");
      return;
    }

    const camposNumericos: string[] = [
      'efectivo',
      'debito',
      'credito',
      'transferencia',
      'cheque',
      'retiro',
      'gasto'
    ];

    camposNumericos.forEach((campo: string) => {
      const control = this.form.get(campo);
      if (control?.value === null) { //si mi campo coincide con el string, pregunto si es null y si lo es seteo (0)
        control?.setValue(0); 
      }
    });

    const idAdmin = this.authService.getIdAdmin();
    const payload = this.form.value;

    this.cobranzaService.postClientDaily(payload, idAdmin).subscribe({
      next: (res) => {
        console.log('Éxito:', res);
        this.closeForm.emit();
        this.cobranzaComponent.ngOnInit();
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
    });
 
    
  }
  ngOnInit() {
  }

}
