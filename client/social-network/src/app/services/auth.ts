// Servicio de autenticación para manejar el login y el JWT
import { computed, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthRequest } from '../models/auth-request';
import { ApiService } from './api';
import { AuthResponse } from '../models/auth-response';
import { Result } from '../models/result';

type JwtPayload = {
  id?: string | number;
  role?: string;
  unique_name?: string;
  AvatarPath?: string | null;
  biografy?: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly jwtSignal = signal<string | null>(null);
  private readonly decodedPayload = computed<JwtPayload | null>(() => {
    const token = this.jwtSignal();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  });

  readonly isAuthenticated = computed(() => !!this.jwtSignal());
  readonly currentUserId = computed(() => {
    const decoded = this.decodedPayload();
    if (!decoded || decoded.id === undefined || decoded.id === null) {
      return null;
    }

    const userId = Number(decoded.id);
    return Number.isNaN(userId) ? null : userId;
  });
  readonly isAdmin = computed(() => {
    const decoded = this.decodedPayload();
    return decoded?.role?.toLowerCase() === 'admin';
  });
  readonly nickname = computed(() => {
    const decoded = this.decodedPayload();
    const nickname = decoded?.unique_name?.trim();
    return nickname && nickname.length > 0 ? nickname : 'Usuario';
  });
  readonly profileImage = computed(() => {
    const decoded = this.decodedPayload();
    const avatarPath = decoded?.AvatarPath?.trim();
    return avatarPath && avatarPath.length > 0 ? avatarPath : '/assets/images/avatar-default.png';
  });
  readonly biografy = computed(() => {
    const decoded = this.decodedPayload();
    const biografy = decoded?.biografy?.trim();
    return biografy && biografy.length > 0 ? biografy : '';
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