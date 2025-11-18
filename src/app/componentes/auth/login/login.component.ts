import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ RouterModule, ReactiveFormsModule, CommonModule ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  errorMessage: string | null = null;
  cargando: Boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }


  ngOnInit(): void {
    // Crear el formulario reactivo con validaciones
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onLogin(): void {
    const { username, password } = this.loginForm.value;
    this.cargando = true;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.authService.storeToken(response.token); // Guarda el token en el almacenamiento
        this.router.navigate(['/']); // Redirige al dashboard
      },
      error: (error) => {
        this.errorMessage = 'Credenciales incorrectas. Intente nuevamente.'; // Muestra mensaje de error
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }


}
