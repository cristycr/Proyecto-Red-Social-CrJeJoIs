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
      const status = error instanceof HttpErrorResponse ? error.status : 500;
      const message = error instanceof HttpErrorResponse ? (error.error?.message || error.message || error.statusText) : error.message || 'Unknown error';
      return Result.error(status, message);
    }
  }

  // Método para obtener los headers de las peticiones
  // Incluyendo el JWT
  private getHeaders(): HttpHeaders {
    let headers: any = {
      'Content-Type': 'application/json'
    };

    if (this.jwt) {
      headers['Authorization'] = `Bearer ${this.jwt}`;
    }

    return new HttpHeaders(headers);
  }

  // Método para obtener las publicaciones
  async getPosts(): Promise<Post[]> {
    const request = this.http.get<Post[]>(`${this.BASE_URL}posts`);
    const response = await lastValueFrom(request);

    return response;
  }

  // Comprueba si existe un usuario con el nickname dado
async getUserByNickname(nickname: string): Promise<boolean> {
  try {
    const response = await lastValueFrom(
      this.http.get(`${this.BASE_URL}users/nickname/${nickname}`, {
        headers: this.getHeaders(),
        observe: 'response'
      })
    );
    return response.status === 200 && !!response.body; // true si existe
  } catch (err: any) {
    if (err.status === 404) return false; // no existe
    throw err; // cualquier otro error
  }
}

// Comprueba si existe un usuario con el email dado
async getUserByEmail(email: string): Promise<boolean> {
  try {
    const response = await lastValueFrom(
      this.http.get(`${this.BASE_URL}users/email/${email}`, {
        headers: this.getHeaders(),
        observe: 'response'
      })
    );
    return response.status === 200 && !!response.body; // true si existe
  } catch (err: any) {
    if (err.status === 404) return false; // no existe
    throw err; // cualquier otro error
  }
}

}