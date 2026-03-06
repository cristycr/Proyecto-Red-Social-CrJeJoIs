import { Component, inject, OnInit, signal } from '@angular/core';
import { Post } from '../../models/post';
import { ApiService } from '../../services/api';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { CreatePostBtn } from '../../components/create-post-btn/create-post-btn';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feed',
  imports: [CreatePostBtn, RouterModule, DatePipe],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {

  posts = signal<Post[]>([]);

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;

  async ngOnInit(): Promise<void> {

    let posts: Post[] = [];

    const userId = this.authService.currentUserId();

    if (userId) {
      posts = await this.apiService.getPostsByLogin(userId);
    } else {
      posts = await this.apiService.getPosts();
    }

    this.posts.set(posts);
  }
}