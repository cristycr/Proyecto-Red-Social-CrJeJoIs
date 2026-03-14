import { Component, input, output } from '@angular/core';
import { Post } from '../../models/post';

@Component({
  selector: 'app-profile-posts-section',
  imports: [],
  templateUrl: './profile-posts-section.html',
  styleUrl: './profile-posts-section.css',
})
export class ProfilePostsSection {
  readonly loading = input(false);
  readonly errorMessage = input('');
  readonly allPostsCount = input(0);
  readonly actionError = input('');
  readonly posts = input<Post[]>([]);
  readonly currentPage = input(1);
  readonly totalPages = input(1);
  readonly postsPerPage = input(10);
  readonly canDeletePost = input<(post: Post) => boolean>(() => false);
  readonly isDeletingPost = input<(postId: number) => boolean>(() => false);
  readonly formatPostDate = input<(dateValue: Date | string) => string>(() => '');

  readonly deletePost = output<Post>();
  readonly previousPage = output<void>();
  readonly nextPage = output<void>();
  readonly postsPerPageChange = output<number>();

  protected onPostsPerPageInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const selectedValue = Number(target.value);

    if (Number.isNaN(selectedValue) || selectedValue <= 0) {
      return;
    }

    this.postsPerPageChange.emit(Math.floor(selectedValue));
  }
}