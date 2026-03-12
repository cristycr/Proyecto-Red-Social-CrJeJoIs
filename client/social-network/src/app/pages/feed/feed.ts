import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal, } from '@angular/core';
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
export class Feed implements OnInit, AfterViewInit, OnDestroy {

  private readonly postsBatchSize = 10;

  posts = signal<Post[]>([]);
  protected readonly initialLoading = signal(true);
  protected readonly loadingError = signal('');
  protected readonly hasMorePosts = computed(
    () => this.posts().length < this.allPosts().length
  );

  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  private readonly allPosts = signal<Post[]>([]);
  private intersectionObserver?: IntersectionObserver;


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

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const anchorVisible = entries.some((entry) => entry.isIntersecting);

        if (anchorVisible) {
          this.loadNextPostsBatch();
        }
      },
      {
        root: null,
        rootMargin: '200px 0px',
      }
    );

    if (this.scrollAnchor?.nativeElement) {
      this.intersectionObserver.observe(this.scrollAnchor.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  private loadNextPostsBatch(): void {
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