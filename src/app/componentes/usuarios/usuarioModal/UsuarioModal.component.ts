import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { RolService } from 'src/app/services/rol.service';
import { Rol } from 'src/assets/dto/rol';

@Component({
  selector: 'app-UsuarioModal',
  standalone: true,
  imports:[ReactiveFormsModule, MatSlideToggleModule, CommonModule],
  templateUrl: './UsuarioModal.component.html',
  styleUrls: ['./UsuarioModal.component.css']
})
export class UsuarioModalComponent implements OnInit {

  registerForm!: FormGroup;
  registerError: string | null = null;
  roles: Rol[] = [];
  rolesUsuario: Rol [] = [];
  cargando: Boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UsuarioModalComponent>,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private rolService: RolService,
  ) { }


  ngOnInit(): void {
    this.getRoles();
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator } // Validación personalizada para contraseñas
    );
  }

  getRoles(){
    this.roles = this.rolService.getRoles()
  }
  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  // Validador personalizado para verificar si las contraseñas coinciden
  passwordsMatchValidator(control: FormGroup): { [key: string]: boolean } | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  crearUsuario(): void {
    this.cargando = true;
    if (this.registerForm.invalid) {
      this.registerError = "Formulario invalido"
      this.cargando = false;
      return;
    }

    const { username, password } = this.registerForm.value;

    const idPadre = this.authService.getIdAdmin();


    this.authService.register(username, password, this.rolesUsuario, idPadre).subscribe({
      next: () => {
        this.router.navigate(['/usuarios']).then(() => {
          location.reload()
        });
      },
      error: (error) => {
        this.registerError = error.error.message;
      },
    });
  }

  onTogglePermiso(rol: Rol): void {
    const index = this.rolesUsuario.indexOf(rol);

    if (index === -1) {
      // No está el rol → lo agregamos
      this.rolesUsuario.push(rol);
    } else {
      // Ya está el rol → lo quitamos
      this.rolesUsuario.splice(index, 1);
    }
  }

}

