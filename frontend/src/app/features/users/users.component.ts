import { Component, OnInit, inject, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  
  users = signal<User[]>([]);
  currentRole = signal<string | null>(null);

  ngOnInit(): void {
    this.currentRole.set(this.authService.getRole());
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.users.set(data),
      error: () => this.toastService.show('Error al cargar usuarios', 'error')
    });
  }

  onRoleChange(user: User, newRole: string): void {
    const oldRole = user.role;
    user.role = newRole; // Optimistic update
    this.userService.updateRole(user.id, newRole).subscribe({
      next: () => this.toastService.show('Rol actualizado con éxito', 'success'),
      error: () => {
        user.role = oldRole; // Revert on failure
        this.toastService.show('No se pudo actualizar el rol', 'error');
      }
    });
  }
}
