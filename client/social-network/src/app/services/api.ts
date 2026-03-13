import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { GetUserDto } from '../models/get-user-dto';
import { Post } from '../models/post';
import { FollowingDto } from '../models/following-dto';
import { GetUserProfileExtendDto } from '../models/get-user-profile-extend-dto';
import { PutUserDto } from '../models/put-user-dto';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  jwt: string | null = null;

  private readonly BASE_URL = 'https://localhost:7185/api/';
  private readonly http = inject(HttpClient);

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
    return await this.get<GetUserDto[]>('users');
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

  // Obtiene la lista de usuarios que siguen a un usuario
  async getFollowedUsers(userId: number): Promise<GetUserDto[]> {
    return await this.get<GetUserDto[]>(`users/Followeds?userId=${userId}`);
  }

  // Obtiene la lista de seguidores de un usuario
  async getFollowerUsers(userId: number): Promise<GetUserDto[]> {
    return await this.get<GetUserDto[]>(`users/Followers?userId=${userId}`);
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