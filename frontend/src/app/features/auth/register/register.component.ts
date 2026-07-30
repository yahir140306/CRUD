import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { form, FormField, submit, required, email, minLength, validate } from '@angular/forms/signals';

@Component({
  selector: 'app-register',
  imports: [FormField, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  showPassword = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  protected readonly registerModel = signal({
    username: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  protected readonly registerForm = form(this.registerModel, (s) => {
    required(s.username, { message: 'El nombre es obligatorio' });
    minLength(s.username, 3, { message: 'Mínimo 3 caracteres' });
    
    required(s.lastname, { message: 'El apellido es obligatorio' });
    minLength(s.lastname, 3, { message: 'Mínimo 3 caracteres' });
    
    required(s.email, { message: 'Un correo válido es obligatorio' });
    email(s.email, { message: 'Email inválido' });
    
    required(s.password, { message: 'La contraseña es obligatoria' });
    minLength(s.password, 6, { message: 'La contraseña debe tener al menos 6 caracteres' });
    
    required(s.confirmPassword, { message: 'Confirmar contraseña es obligatorio' });
    
    validate(s.confirmPassword, ({ valueOf }) => {
      const p1 = valueOf(s.password);
      const p2 = valueOf(s.confirmPassword);
      if (p1 && p2 && p1 !== p2) {
        return { kind: 'passwordsMismatch', message: 'Las contraseñas no coinciden' };
      }
      return undefined;
    });
  });

  togglePassword() {
    this.showPassword.update((visible) => !visible);
  }

  onSubmit() {
    submit(this.registerForm, async () => {
      this.error.set('');
      this.success.set('');
      this.loading.set(true);

      const { username, lastname, email, password } = this.registerModel();

      this.authService
        .register({
          username,
          lastname,
          email,
          password,
        })
        .subscribe({
          next: () => {
            this.toastService.show('¡Usuario creado correctamente!', 'success');
            setTimeout(() => this.router.navigate(['/login']), 1800);
          },
          error: (err: HttpErrorResponse) => {
            const errorMsg = err.error?.message || err.error || err.message || 'Error al registrarse';
            this.toastService.show('Error al registrarse', 'error');
            this.loading.set(false);
          },
        });
    });
  }
}
