import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  togglePassword() {
    this.showPassword.update((visible) => !visible);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.error.set('Completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.error || err.message || 'Error al iniciar sesión';
        this.error.set(
          err.status === 401 ? 'Correo o contraseña incorrectos' : `Error: ${errorMsg}`,
        );
        this.loading.set(false);
      },
    });
  }
}
