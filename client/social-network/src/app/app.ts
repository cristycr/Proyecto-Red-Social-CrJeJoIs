import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from './services/auth';
import { ApiService } from './services/api';
import { GetUserDto } from './models/get-user-dto';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);

  private usersRequested = false;

  @ViewChild('userSearchContainer') private userSearchContainer?: ElementRef<HTMLDivElement>;

  protected readonly title = signal('social-network');
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly isAdmin = this.authService.isAdmin;
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
    const cleanAvatarPath = avatarPath?.trim();

    if (!cleanAvatarPath) {
      return '/assets/images/avatar-default.png';
    }

    if (
      cleanAvatarPath.startsWith('http://') ||
      cleanAvatarPath.startsWith('https://')
    ) {
      return cleanAvatarPath;
    }

    if (cleanAvatarPath.startsWith('/uploads/')) {
      return `https://localhost:7185${cleanAvatarPath}`;
    }

    if (cleanAvatarPath.startsWith('uploads/')) {
      return `https://localhost:7185/${cleanAvatarPath}`;
    }

    return `https://localhost:7185/uploads/${cleanAvatarPath}`;
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const searchContainer = this.userSearchContainer?.nativeElement;
    const target = event.target as Node | null;

    if (!searchContainer || !target) {
      return;
    }

    if (!searchContainer.contains(target)) {
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