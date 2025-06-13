import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from '../../../services/cobranza.service';

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
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      detalle: ['', Validators.required],
      efectivo: [0],
      debito: [0],
      credito: [0],
      transferencia: [0],
      cheque: [0],
      retiro: [0],
      observacion: [''],
      gasto: [0],
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
    
    const idAdmin = this.authService.getIdAdmin();
    const payload = this.form.value;

    this.cobranzaService.postClientDaily(payload, idAdmin).subscribe({
      next: (res) => {
        console.log('Éxito:', res);
        this.closeForm.emit();
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
