import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { GetUserDto } from '../models/get-user-dto';
import { Post } from '../models/post';
import { FollowingDto } from '../models/following-dto';
import { GetUserProfileExtendDto } from '../models/get-user-profile-extend-dto';
import { PutPasswordDto } from '../models/put-password-dto';
import { PutUserDto } from '../models/put-user-dto';
import { GetAdminDto } from '../models/get-admin-dto';
import { PutUserRoleDto } from '../models/put-user-role-dto';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  jwt: string | null = null;

  private readonly API_ORIGIN = 'https://localhost:7185';
  private readonly BASE_URL = `${this.API_ORIGIN}/api/`;
  private readonly http = inject(HttpClient);

  buildAvatarUrl(avatarPath: string | null | undefined): string {
    const cleanAvatarPath = avatarPath?.trim();

    if (!cleanAvatarPath) {
      return '/assets/images/avatar-default.png';
    }

    if (cleanAvatarPath.startsWith('/assets/')) {
      return cleanAvatarPath;
    }

    const normalizedFileName = cleanAvatarPath
      .replace(/^https?:\/\/localhost:7185\/uploads\//i, '')
      .replace(/^\/?uploads\//i, '');

    return `${this.API_ORIGIN}/uploads/${normalizedFileName}`;
  }

  // Método para hacer peticiones POST a la API
  async post<T>(path: string, body: any): Promise<T> {
    return await lastValueFrom(
      this.http.post<T>(`${this.BASE_URL}${path}`, body)
    );
  }

  // Método para hacer peticiones GET a la API
  async get<T>(path: string): Promise<T> {
    return await lastValueFrom(
      this.http.get<T>(`${this.BASE_URL}${path}`)
    );
  }

  // Metodo para hacer peticiones DELETE a la API
  async delete(path: string, body?: any): Promise<void> {
    await lastValueFrom(
      this.http.delete<void>(`${this.BASE_URL}${path}`, { body })
    );
  }

  // Método para hacer peticiones PUT a la API
  async put<T>(path: string, body: any): Promise<T> {
    return await lastValueFrom(
      this.http.put<T>(`${this.BASE_URL}${path}`, body)
    );
  }

  // Método para obtener las publicaciones para el invitado
  async getPosts(): Promise<Post[]> {
    return await this.get<Post[]>('posts');
  }

  // Método para obtener las publicaciones del feed del usuario logueado
  async getPostsByLogin(userId: number): Promise<Post[]> {
    return await this.get<Post[]>(`posts/login?userId=${userId}`);
  }

  // Método para obtener las publicaciones de un usuario concreto
  async getPostsByUserId(userId: number): Promise<Post[]> {
    return await this.get<Post[]>(`posts/by-user/${userId}`);
  }

  // Método para eliminar una publicación por id
  async deletePost(postId: number): Promise<void> {
    await this.delete('posts', { id: postId });
  }

  // Método para obtener todos los usuarios
  async getAllUsers(): Promise<GetUserDto[]> {
    const users = await this.get<unknown>('users');
    return this.normalizeUsersDto(users);
  }

  // Método para obtener todos los usuarios en el panel admin
  async getAdminUsers(): Promise<GetAdminDto[]> {
    return await this.get<GetAdminDto[]>('admin');
  }

  // Método para actualizar el rol de un usuario desde el panel admin
  async updateUserRole(userId: number, dto: PutUserRoleDto): Promise<PutUserRoleDto> {
    return await this.put<PutUserRoleDto>(`admin/${userId}Role`, dto);
  }

  // Método para eliminar un usuario desde el panel admin
  async deleteUserByAdmin(userId: number): Promise<void> {
    await this.delete(`admin/${userId}`);
  }

  // Comprueba si existe un usuario con el nickname dado
  async getUserByNickname(nickname: string): Promise<boolean> {
    try {
      await this.get(`users/by-nickname/${nickname}`);
      return true;
    } catch (err: any) {
      if (err.status === 404) return false;
      throw err;
    }
  }

  // Comprueba si existe un usuario con el email dado
  async getUserByEmail(email: string): Promise<boolean> {
    try {
      await this.get(`users/by-email/${encodeURIComponent(email)}`);
      return true;
    } catch (err: any) {
      if (err.status === 404) return false;
      throw err;
    }
  }

  // Obtiene el perfil público de un usuario por su id
  async getUserProfileById(userId: number): Promise<any> {
    return await this.get<any>(`users/${userId}/profile`);
  }

  // Obtiene el perfil extendido (email, nombre, apellidos y biografia) de un usuario
  async getUserProfileExtendById(userId: number): Promise<GetUserProfileExtendDto> {
    return await this.get<GetUserProfileExtendDto>(`users/all?userId=${userId}`);
  }

  // Actualiza los datos de perfil de un usuario
  async updateUser(userId: number, dto: PutUserDto): Promise<PutUserDto> {
    return await this.put<PutUserDto>(`users?id=${userId}`, dto);
  }

  // Actualiza la contraseña de un usuario
  async updatePassword(userId: number, dto: PutPasswordDto): Promise<PutPasswordDto> {
    return await this.put<PutPasswordDto>(`users/password?id=${userId}`, dto);
  }

  // Obtiene la lista de usuarios que siguen a un usuario
  async getFollowedUsers(userId: number): Promise<GetUserDto[]> {
    const users = await this.get<unknown>(`users/Followeds?userId=${userId}`);
    return this.normalizeUsersDto(users);
  }

  // Obtiene la lista de seguidores de un usuario
  async getFollowerUsers(userId: number): Promise<GetUserDto[]> {
    const users = await this.get<unknown>(`users/Followers?userId=${userId}`);
    return this.normalizeUsersDto(users);
  }

  private normalizeUsersDto(users: unknown): GetUserDto[] {
    if (!Array.isArray(users)) {
      return [];
    }

    return users
      .map((user) => this.normalizeUserDto(user))
      .filter((user) => user.id > 0 && user.nickname.length > 0);
  }

  private normalizeUserDto(user: unknown): GetUserDto {
    const raw = (user as Record<string, unknown>) ?? {};
    const parsedId = Number(raw['id'] ?? raw['Id'] ?? 0);
    const nickname = this.normalizeString(raw['nickname'] ?? raw['Nickname']) ?? '';

    return {
      id: Number.isNaN(parsedId) ? 0 : parsedId,
      nickname,
      avatarPath: this.normalizeString(raw['avatarPath'] ?? raw['AvatarPath']),
      name: this.normalizeString(raw['name'] ?? raw['Name']),
      surname1: this.normalizeString(raw['surname1'] ?? raw['Surname1']),
      surname2: this.normalizeString(raw['surname2'] ?? raw['Surname2']),
    };
  }

  private normalizeString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  async followUser(dto: FollowingDto): Promise<FollowingDto> {
    try {
      return await this.post<FollowingDto>('following', dto);
    } catch (err: any) {
      if (err?.status === 404) {
        return await this.post<FollowingDto>('followings', dto);
      }

      throw err;
    }
  }

  async unfollowUser(followerId: number, followedId: number): Promise<void> {
    const body: FollowingDto = { followerId, followedId };

    try {
      await this.delete('following', body);
    } catch (err: any) {
      if (err?.status === 404) {
        await this.delete('followings', body);
        return;
      }

      throw err;
    }
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await lastValueFrom(
        this.http.post<{ avatarUrl: string }>(
          `${this.BASE_URL}users/avatar`,
          formData
        )
      );

      return { avatarUrl: response.avatarUrl || `/uploads/${response.avatarUrl}` };

    } catch (err: any) {
      console.error('Error subiendo avatar:', err);
      throw err;
    }
  }

  async deleteAvatar(): Promise<void> {
    try {
      await lastValueFrom(
        this.http.delete(`${this.BASE_URL}users/avatar`)
      );
    } catch (err: any) {
      console.error('Error eliminando avatar:', err);
      throw err;
    }
  }
}