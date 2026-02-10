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
  
  constructor(private api: ApiService) {}

  async login(authData: AuthRequest): Promise<Result<AuthResponse>> {
    const result = await this.api.post<AuthResponse>('auth/login', authData);

    if (result.success) {
      this.api.jwt = result.data.accessToken;
      // Se guarda el token en localStorage
      localStorage.setItem('jwt', result.data.accessToken);
    }

    return result;
  }

  // Método para obtener el token JWT actual
  getToken(): string | null {
    return this.api.jwt;
  }
}
