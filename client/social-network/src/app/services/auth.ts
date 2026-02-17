// Servicio de autenticación para manejar el login y el JWT
import { computed, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthRequest } from '../models/auth-request';
import { ApiService } from './api';
import { AuthResponse } from '../models/auth-response';
import { Result } from '../models/result';

type JwtPayload = {
  role?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly jwtSignal = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.jwtSignal());
  readonly isAdmin = computed(() => {
    const token = this.jwtSignal();
    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.role?.toLowerCase() === 'admin';
    } catch {
      return false;
    }
  });

  // Mantiene compatibilidad con el código existente
  get jwt(): string | null {
    return this.jwtSignal();
  }

  set jwt(value: string | null) {
    this.jwtSignal.set(value);
    this.api.jwt = value;
  }
  
  constructor(private api: ApiService) {}

  // Establece el JWT que viene del localStorage
  setJwt(jwt: string): void {
    this.jwt = jwt;
  }

  async login(authData: AuthRequest, rememberMe: boolean = false): Promise<Result<AuthResponse>> {
    const result = await this.api.post<AuthResponse>('auth/login', authData);

    if (result.success) {
      const token = result.data.accessToken;
      this.jwt = token;
      
      // Se guarda el token en localStorage solo si rememberMe es true
      if (rememberMe) {
        localStorage.setItem('jwt', token);
      }
    }

    return result;
  }
}