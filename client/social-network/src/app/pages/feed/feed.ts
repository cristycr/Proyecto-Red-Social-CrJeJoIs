import { Component, inject, OnInit, signal } from '@angular/core';
import { Post } from '../../models/post';
import { ApiService } from '../../services/api';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-feed',
  imports: [DatePipe],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  posts = signal<Post[]>([]);

  private apiService = inject(ApiService);

  async ngOnInit() :Promise<void> {
    const posts = await this.apiService.getPosts();
    this.posts.set(posts);
  }
}
