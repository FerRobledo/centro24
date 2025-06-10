import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RolService } from 'src/app/services/rol.service';
import { Usuario, newUsuario } from 'src/assets/dto/usuario';

@Component({
  selector: 'app-UsuarioModal',
  templateUrl: './UsuarioModal.component.html',
  styleUrls: ['./UsuarioModal.component.css']
})
export class UsuarioModalComponent implements OnInit {

  registerForm!: FormGroup;
  registerError: string | null = null;
  roles: string[] = [];
  rolesUsuario: string [] = [];

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
    if (this.registerForm.invalid) {
      this.registerError = "Formulario invalido"
      return;
    }

    const { username, password } = this.registerForm.value;

    this.authService.register(username, password, this.rolesUsuario).subscribe({
      next: () => {
        this.router.navigate(['/usuarios']);
      },
      error: () => {
        this.registerError = 'Hubo un error al registrar el usuario. Intente nuevamente.';
      },
    });
  }

  onTogglePermiso(rol: string): void {
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

