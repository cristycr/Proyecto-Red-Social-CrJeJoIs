import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Post } from '../models/post';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly BASE_URL = 'https://localhost:7185/api/';
  jwt: string | null = null;
  private http = inject(HttpClient);

  // Método para hacer peticiones POST a la API
  async post<T = void>(path: string, body: any): Promise<Result<T>> {
    try {
      const response = await lastValueFrom(
        this.http.post<T>(`${this.BASE_URL}${path}`, body, {
          headers: this.getHeaders(),
          observe: 'response'
        })
      );
      return Result.success(response.status, response.body as T);
    } catch (error: any) {
      let message = 'Error desconocido';
      let status = 500;
      if (error instanceof HttpErrorResponse) {
        status = error.status;
        message = error.error || error.message || error.statusText;
      }
      return Result.error(status, message);
    }
  }

  // Método para obtener los headers de las peticiones
  // Incluyendo el JWT
  private getHeaders(): HttpHeaders {
    let headers: any = { 'Content-Type': 'application/json' };
    if (this.jwt) headers['Authorization'] = `Bearer ${this.jwt}`;
    return new HttpHeaders(headers);
  }

  // Método para obtener las publicaciones para el invitado
  async getPosts(): Promise<Post[]> {
    const request = this.http.get<Post[]>(`${this.BASE_URL}posts`);
    return await lastValueFrom(request);
  }

  // Método para obtener las publicaciones del feed del usuario logueado
  async getPostsByLogin(userId: number): Promise<Post[]> {
    const request = this.http.get<Post[]>(`${this.BASE_URL}posts/login?userId=${userId}`, {
      headers: this.getHeaders()
    });
    return await lastValueFrom(request);
  }

  // Comprueba si existe un usuario con el nickname dado
  async getUserByNickname(nickname: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.http.get(`${this.BASE_URL}users/by-nickname/${nickname}`, {
          headers: this.getHeaders(),
          observe: 'response'
        })
      );
      return response.status === 200 && !!response.body;
    } catch (err: any) {
      if (err.status === 404) return false;
      throw err;
    }
  }

   // Comprueba si existe un usuario con el email dado
  async getUserByEmail(email: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.http.get(`${this.BASE_URL}users/by-email/${email}`, {
          headers: this.getHeaders(),
          observe: 'response'
        })
      );
      return response.status === 200 && !!response.body;
    } catch (err: any) {
      if (err.status === 404) return false;
      throw err;
    }
  }

  // Obtiene el perfil público de un usuario por su id
  async getUserProfileById(userId: number): Promise<any> {
    const request = this.http.get<any>(`${this.BASE_URL}users/${userId}/profile`, {
      headers: this.getHeaders()
    });
    const response = await lastValueFrom(request);

    // Aseguramos que siempre tenga avatarUrl
    if (response) {
      response.avatarUrl = response.avatarUrl || (response.avatarPath ? `/uploads/${response.avatarPath}` : null);
    }
    return response;
  }

  // Subir avatar
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await lastValueFrom(
        this.http.post<{ avatarUrl: string }>(
          `${this.BASE_URL}users/avatar`,
          formData,
          {
            headers: this.jwt ? new HttpHeaders({ 'Authorization': `Bearer ${this.jwt}` }) : undefined
          }
        )
      );
      // Siempre devolver avatarUrl
      return { avatarUrl: response.avatarUrl || `/uploads/${response.avatarUrl}` };
    } catch (err: any) {
      console.error('Error subiendo avatar:', err);
      throw err;
    }
  }

  // Eliminar avatar
  async deleteAvatar(): Promise<void> {
    try {
      await lastValueFrom(
        this.http.delete(`${this.BASE_URL}users/avatar`, {
          headers: this.getHeaders()
        })
      );
    } catch (err: any) {
      console.error('Error eliminando avatar:', err);
      throw err;
    }
  }
}