import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Post } from '../models/post';

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

  // Método para obtener las publicaciones para el invitado
  async getPosts(): Promise<Post[]> {
    return await this.get<Post[]>('posts');
  }

  // Método para obtener las publicaciones del feed del usuario logueado
  async getPostsByLogin(userId: number): Promise<Post[]> {
    return await this.get<Post[]>(`posts/login?userId=${userId}`);
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
      await this.get(`users/by-email/${email}`);
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