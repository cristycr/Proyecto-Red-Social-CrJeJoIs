import { Component, computed, input, output } from '@angular/core';
import { Post } from '../../models/post';

type PaginationItem =
  | {
      kind: 'page';
      page: number;
    }
  | {
      kind: 'ellipsis';
      key: 'left' | 'right';
    };

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
  readonly isReverseOrder = input(false);
  readonly postsPerPage = input(10);
  readonly canDeletePost = input<(post: Post) => boolean>(() => false);
  readonly isDeletingPost = input<(postId: number) => boolean>(() => false);
  readonly formatPostDate = input<(dateValue: Date | string) => string>(() => '');

  readonly deletePost = output<Post>();
  readonly previousPage = output<void>();
  readonly nextPage = output<void>();
  readonly pageSelected = output<number>();
  readonly toggleReverseOrder = output<void>();
  readonly postsPerPageChange = output<number>();
  protected readonly paginationItems = computed(() =>
    this.buildPaginationItems(this.currentPage(), this.totalPages())
  );

  protected onPostsPerPageInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const selectedValue = Number(target.value);

    if (Number.isNaN(selectedValue) || selectedValue <= 0) {
      return;
    }

    this.postsPerPageChange.emit(Math.floor(selectedValue));
  }

  protected onPageClick(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.pageSelected.emit(page);
  }

  protected trackPaginationItem(item: PaginationItem): string {
    return item.kind === 'page' ? `page-${item.page}` : `ellipsis-${item.key}`;
  }

  private buildPaginationItems(
    currentPage: number,
    totalPages: number
  ): PaginationItem[] {
    const safeTotalPages = Math.max(1, Math.floor(totalPages));
    const safeCurrentPage = Math.min(
      Math.max(1, Math.floor(currentPage)),
      safeTotalPages
    );

    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, index) => ({
        kind: 'page' as const,
        page: index + 1,
      }));
    }

    const items: PaginationItem[] = [{ kind: 'page', page: 1 }];

    let startPage = Math.max(2, safeCurrentPage - 1);
    let endPage = Math.min(safeTotalPages - 1, safeCurrentPage + 1);

    if (safeCurrentPage <= 3) {
      startPage = 2;
      endPage = 4;
    } else if (safeCurrentPage >= safeTotalPages - 2) {
      startPage = safeTotalPages - 3;
      endPage = safeTotalPages - 1;
    }

    if (startPage > 2) {
      items.push({ kind: 'ellipsis', key: 'left' });
    }

    for (let page = startPage; page <= endPage; page += 1) {
      items.push({ kind: 'page', page });
    }

    if (endPage < safeTotalPages - 1) {
      items.push({ kind: 'ellipsis', key: 'right' });
    }

    items.push({ kind: 'page', page: safeTotalPages });

    return items;
  }
}