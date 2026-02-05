import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly BASE_URL = 'https://localhost:7185/api/';

  private http = inject(HttpClient);

  async getPosts(): Promise<Post[]> {
    const request = this.http.get<Post[]>(`${this.BASE_URL}posts`);
    const response = await lastValueFrom(request);

    return response;
  }
}
