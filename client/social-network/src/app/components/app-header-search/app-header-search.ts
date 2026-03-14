import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { GetUserDto } from '../../models/get-user-dto';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-header-search',
  imports: [RouterModule],
  templateUrl: './app-header-search.html',
  styleUrl: './app-header-search.css',
})
export class AppHeaderSearch {
  private readonly apiService = inject(ApiService);
  private usersRequested = false;

  @ViewChild('userSearchContainer') private userSearchContainer?: ElementRef<HTMLDivElement>;

  protected readonly searchQuery = signal('');
  protected readonly usersLoading = signal(false);
  protected readonly usersLoadError = signal('');
  protected readonly searchOpen = signal(false);
  protected readonly allUsers = signal<GetUserDto[]>([]);
  protected readonly filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.allUsers()
      .filter((user) => user.nickname.toLowerCase().includes(query))
      .slice(0, 10);
  });
  protected readonly showSearchDropdown = computed(() =>
    this.searchOpen() && this.searchQuery().trim().length > 0
  );

  protected async onSearchInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this.searchQuery.set(value);

    if (value.trim().length === 0) {
      this.searchOpen.set(false);
      return;
    }

    this.searchOpen.set(true);
    await this.ensureUsersLoaded();
  }

  protected async onSearchFocus(): Promise<void> {
    if (this.searchQuery().trim().length > 0) {
      this.searchOpen.set(true);
    }

    await this.ensureUsersLoaded();
  }

  protected onUserResultClick(): void {
    this.searchQuery.set('');
    this.searchOpen.set(false);
  }

  protected closeSearch(): void {
    this.searchOpen.set(false);
  }

  protected retryUsersSearchLoad(): void {
    this.usersRequested = false;
    void this.ensureUsersLoaded();
  }

  protected buildAvatarUrl(avatarPath: string | null): string {
    return this.apiService.buildAvatarUrl(avatarPath);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const searchContainer = this.userSearchContainer?.nativeElement;
    const target = event.target as Node | null;

    if (!target) {
      return;
    }

    if (searchContainer && !searchContainer.contains(target)) {
      this.searchOpen.set(false);
    }
  }

  private async ensureUsersLoaded(): Promise<void> {
    if (this.usersLoading() || this.usersRequested) {
      return;
    }

    this.usersRequested = true;
    this.usersLoading.set(true);
    this.usersLoadError.set('');

    try {
      const users = await this.apiService.getAllUsers();
      this.allUsers.set(users);
    } catch {
      this.usersLoadError.set('No se pudo cargar la lista de usuarios.');
    } finally {
      this.usersLoading.set(false);
    }
  }
}