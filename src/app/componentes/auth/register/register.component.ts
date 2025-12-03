import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  registerError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }


  ngOnInit(): void {
    // Crear el formulario reactivo con validaciones
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator } // Validación personalizada para contraseñas
    );
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

  onRegister(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const { username, password } = this.registerForm.value;

    this.authService.register(username, password, [{id: 4, nombre: 'Admin'}]).subscribe({
      next: (response: any) => {
        // Redirige al login después de un registro exitoso
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        // Muestra el error si la solicitud de registro falla
        this.registerError = 'Hubo un error al registrar el usuario. Intente nuevamente.';
      },
    });
  }

}
