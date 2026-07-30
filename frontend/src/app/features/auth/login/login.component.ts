import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { form, FormField, submit, required, email, minLength } from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [FormField, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  protected readonly loginModel = signal({
    email: '',
    password: ''
  });

  protected readonly loginForm = form(this.loginModel, (s) => {
    required(s.email, { message: 'Email es requerido' });
    email(s.email, { message: 'Email inválido' });
    
    required(s.password, { message: 'Contraseña es requerida' });
    minLength(s.password, 6, { message: 'Mínimo 6 caracteres' });
  });

  togglePassword() {
    this.showPassword.update((visible) => !visible);
  }

  onSubmit() {
    submit(this.loginForm, async () => {
      this.loading.set(true);
      this.error.set('');

      const { email, password } = this.loginModel();

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
    });
  }
}
