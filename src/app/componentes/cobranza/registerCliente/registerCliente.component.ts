import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { CobranzaService } from '../../../services/cobranza.service';
import { CobranzaComponent } from '../cobranza.component';
import { OnChanges, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-registerCliente',
  templateUrl: './registerCliente.component.html',
  styleUrls: ['./registerCliente.component.css']
})
export class RegisterClienteComponent implements OnInit {
  //emite eventos
  @Output() closeForm = new EventEmitter<void>();
  @Input() clientEdit: any;
  editMode = false;
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

  //se dispara automáticamente cuando cambia un @Input() en algun hijo.
  //si se cambio la variable hago update de lo nuevo que se cambio en el form
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientEdit'] && this.clientEdit) {
      this.editMode = true;
      this.form.patchValue({
        detalle: this.clientEdit.detalle ?? '',
        efectivo: this.clientEdit.efectivo,
        debito: this.clientEdit.debito,
        credito: this.clientEdit.credito,
        transferencia: this.clientEdit.transferencia,
        cheque: this.clientEdit.cheque,
        retiro: this.clientEdit.retiro,
        observacion: this.clientEdit.observacion ?? '',
        gasto: this.clientEdit.gasto
      });
    }
  }

  onCancel() {
    this.closeForm.emit();
  }

  onSubmit() {
    if (this.form.invalid) {
      console.log("Formulario inválido");
      return;
    }

    const camposNumericos: string[] = [
      'efectivo', 'debito', 'credito', 'transferencia', 'cheque', 'retiro', 'gasto'
    ];

    camposNumericos.forEach((campo: string) => {
      const control = this.form.get(campo);
      //si control existe, devolveme su .value, si no existe (null o undefined), devolveme undefined y no rompas el programa
      if (control?.value === null) { //si mi campo coincide con el string, pregunto si es null y si lo es seteo (0)
        control?.setValue(0);
      }
    });

    const payload = this.form.value;
    const idAdmin = this.authService.getIdAdmin();

    if (this.editMode && this.clientEdit?.id) {      
      this.cobranzaService.updateClient(this.clientEdit.id, idAdmin, payload).subscribe({
        next: (res) => {
          console.log('Cliente actualizado:', res);
          this.closeForm.emit();
          this.form.reset();
          //this.clientEdit = null;
          console.log("el cliente que se edito fue: ", this.clientEdit);
          this.cobranzaComponent.ngOnInit();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
        }
      });
    } else {
      this.cobranzaService.postClientDaily(payload, idAdmin).subscribe({
        next: (res) => {
          console.log('Cliente registrado:', res);
          this.closeForm.emit();
          this.cobranzaComponent.ngOnInit();          
        },
        error: (err) => {
          console.error('Error al registrar:', err);
        }
      });
    }
  }

  ngOnInit() {
  }
}
