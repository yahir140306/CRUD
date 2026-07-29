import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';

export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordsMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  showPassword = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    lastname: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordsMatchValidator });

  togglePassword() {
    this.showPassword.update((visible) => !visible);
  }

  onSubmit() {
    this.error.set('');
    this.success.set('');

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      
      if (this.registerForm.errors?.['passwordsMismatch']) {
         this.error.set('Las contraseñas no coinciden');
      } else {
         this.error.set('Por favor, corrige los errores en el formulario');
      }
      return;
    }

    this.loading.set(true);

    const { username, lastname, email, password } = this.registerForm.getRawValue();

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
  }
}
