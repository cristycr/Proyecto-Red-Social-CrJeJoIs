// Servicio de autenticación para manejar el login y el JWT
import { Injectable } from '@angular/core';
import { AuthRequest } from '../models/auth-request';
import { ApiService } from './api';
import { AuthResponse } from '../models/auth-response';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // JWT en memoria (muere al cerrar la página)
  jwt: string | null = null;
  
  constructor(private api: ApiService) {}

  // Establece el JWT que viene del localStorage
  setJwt(jwt: string): void {
    this.jwt = jwt;
    this.api.jwt = jwt;
  }

  async login(authData: AuthRequest, rememberMe: boolean = false): Promise<Result<AuthResponse>> {
    const result = await this.api.post<AuthResponse>('auth/login', authData);

    if (result.success) {
      const token = result.data.accessToken;
      this.jwt = token;
      this.api.jwt = token;
      
      // Se guarda el token en localStorage solo si rememberMe es true
      if (rememberMe) {
        localStorage.setItem('jwt', token);
      }
    }

    return result;
  }
}