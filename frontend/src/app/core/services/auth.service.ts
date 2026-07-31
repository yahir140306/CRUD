import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  username: string;
  email: string;
  lastname: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  lastname: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);

  isAuthenticated = signal<boolean>(!!localStorage.getItem('auth_token'));

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        email: credentials.email,
        password: credentials.password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('auth_token', response.token);
          if (response.refreshToken) localStorage.setItem('refresh_token', response.refreshToken);
          localStorage.setItem('profileName', response.username);
          localStorage.setItem('role', response.role);
          this.isAuthenticated.set(true);
        }),
      );
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/refresh`, {
        refreshToken: refreshToken,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('auth_token', response.token);
          if (response.refreshToken) localStorage.setItem('refresh_token', response.refreshToken);
          localStorage.setItem('role', response.role);
          this.isAuthenticated.set(true);
        }),
      );
  }

  register(data: RegisterRequest) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, {
      username: data.username,
      email: data.email,
      password: data.password,
      lastname: data.lastname,
    });
  }

  logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    const token = localStorage.getItem('auth_token');
    
    // Opcional: Avisar al backend, pero no bloqueamos el frontend
    if (refreshToken && token) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({ error: () => {} });
    }

    // Limpiar TODO inmediatamente
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('profileName');
    localStorage.removeItem('role');
    
    // Forzar actualización del estado (esto cambiará la vista)
    this.isAuthenticated.set(false);
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);
          localStorage.setItem('profileName', response.username);
          localStorage.setItem('role', response.role);
        }
      })
    );
  }

  getAuthorizationHeader(): string | null {
    const token = localStorage.getItem('auth_token');
    return token ? `Bearer ${token}` : null;
  }

  getUsername(): string | null {
    return localStorage.getItem('profileName');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }
}
