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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('profileName');
    this.isAuthenticated.set(false);
    return this.http.post(`${this.apiUrl}/logout`, { refreshToken });
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);
          localStorage.setItem('profileName', response.username);
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
}
