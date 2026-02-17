import { Component, inject, OnInit, signal } from '@angular/core';
import { Post } from '../../models/post';
import { ApiService } from '../../services/api';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-feed',
  imports: [DatePipe],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  posts = signal<Post[]>([]);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  async ngOnInit(): Promise<void> {
    let posts: Post[] = [];
    // Leer JWT de localStorage o de la variable local de AuthService
    let jwt = localStorage.getItem('jwt');
    if (!jwt) {
      jwt = this.authService.jwt;
    }
    let userId: number | null = null;
    if (jwt) {
      try {
        const decoded: any = jwtDecode(jwt);
        if (decoded && decoded.id) {
          userId = Number(decoded.id);
        }
      } catch {}
    }
    if (userId) {
      posts = await this.apiService.getPostsByLogin(userId);
    } else {
      posts = await this.apiService.getPosts();
    }
    this.posts.set(posts);
  }
}
