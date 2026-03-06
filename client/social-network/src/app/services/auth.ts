import { computed, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthRequest } from '../models/auth-request';
import { AuthResponse } from '../models/auth-response';
import { RegisterRequest } from '../models/register-request';
import { ApiService } from './api';

type JwtPayload = {
  id?: string | number;
  role?: string;
  unique_name?: string;
  AvatarPath?: string;
  biography?: string;
  FollowerCount?: number | string;
  FollowedCount?: number | string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly jwtSignal = signal<string | null>(null);

  private readonly decodedPayload = computed<JwtPayload | null>(() => {
    const token = this.jwtSignal();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  });

  readonly isAuthenticated = computed(() => !!this.jwtSignal());

  readonly currentUserId = computed(() => {
    const decoded = this.decodedPayload();
    if (!decoded?.id) return null;

    const id = Number(decoded.id);
    return Number.isNaN(id) ? null : id;
  });

  readonly isAdmin = computed(() =>
    this.decodedPayload()?.role?.toLowerCase() === 'admin'
  );

  readonly nickname = computed(() => {
    const nickname = this.decodedPayload()?.unique_name?.trim();
    return nickname && nickname.length > 0 ? nickname : 'Usuario';
  });

  readonly profileImage = computed(() => {
    const avatarPath = this.decodedPayload()?.AvatarPath?.trim();
    return avatarPath && avatarPath.length > 0
      ? avatarPath
      : '/assets/images/avatar-default.png';
  });

  readonly biography = computed(() =>
    this.decodedPayload()?.biography?.trim() || ''
  );

  readonly followerCount = computed(() => {
    const value = this.decodedPayload()?.FollowerCount;
    const n = Number(value ?? 0);
    return Number.isNaN(n) ? 0 : n;
  });

  readonly followedCount = computed(() => {
    const value = this.decodedPayload()?.FollowedCount;
    const n = Number(value ?? 0);
    return Number.isNaN(n) ? 0 : n;
  });

  get jwt(): string | null {
    return this.jwtSignal();
  }

  set jwt(value: string | null) {
    this.jwtSignal.set(value);
    this.api.jwt = value;
  }

  constructor(private api: ApiService) {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      this.setJwt(jwt);
    }
  }

  setJwt(jwt: string): void {
    this.jwt = jwt;
  }

  async login(
    authData: AuthRequest,
    rememberMe: boolean = false
  ): Promise<boolean> {
    const response = await this.api.post<AuthResponse>('auth/login', authData);

    if (response?.accessToken) {
      this.jwt = response.accessToken;

      if (rememberMe) {
        localStorage.setItem('jwt', response.accessToken);
      }

      return true;
    }

    return false;
  }

  async register(registerData: RegisterRequest): Promise<boolean> {
    await this.api.post('auth/register', registerData);
    return true;
  }
}