import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  success = signal('');

  profileForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    lastname: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['']
  });

  onSubmit() {
    this.error.set('');
    this.success.set('');

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.error.set('Por favor, corrige los errores en el formulario');
      return;
    }

    this.loading.set(true);

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res: any) => {
        this.success.set('¡Perfil actualizado con éxito!');
        this.loading.set(false);
        this.profileForm.get('newPassword')?.reset();
        
        // Use timeout to allow user to see success message before reload
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.error?.message || err.error || err.message || 'Error al actualizar perfil';
        this.error.set(err.status === 400 ? 'Datos inválidos' : `Error: ${errorMsg}`);
        this.loading.set(false);
      }
    });
  }
}
