import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Post } from '../../models/post';
import { ApiService } from '../../services/api';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { CreatePostBtn } from '../../components/create-post-btn/create-post-btn';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feed',
  imports: [CreatePostBtn, RouterModule, DatePipe, InfiniteScrollDirective],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {

  private readonly postsBatchSize = 10;

  posts = signal<Post[]>([]);
  protected readonly initialLoading = signal(true);
  protected readonly loadingError = signal('');
  protected readonly hasMorePosts = computed(
    () => this.posts().length < this.allPosts().length
  );

  private readonly allPosts = signal<Post[]>([]);


  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;

  async ngOnInit(): Promise<void> {
    this.initialLoading.set(true);
    this.loadingError.set('');

    try {
      let fetchedPosts: Post[] = [];

      const userId = this.authService.currentUserId();

      if (userId) {
        fetchedPosts = await this.apiService.getPostsByLogin(userId);
      } else {
        fetchedPosts = await this.apiService.getPosts();
      }

      this.allPosts.set(fetchedPosts);
      this.posts.set([]);
      this.loadNextPostsBatch();
    } catch {
      this.allPosts.set([]);
      this.posts.set([]);
      this.loadingError.set('No se pudieron cargar las publicaciones.');
    } finally {
      this.initialLoading.set(false);
    }
  }

  protected buildAvatarUrl(avatarPath: string | null): string {
    return this.apiService.buildAvatarUrl(avatarPath);
  }

  protected loadNextPostsBatch(): void {
    if (!this.hasMorePosts()) {
      return;
    }

    const nextVisiblePostsCount = Math.min(
      this.posts().length + this.postsBatchSize,
      this.allPosts().length
    );

    this.posts.set(this.allPosts().slice(0, nextVisiblePostsCount));
  }
}