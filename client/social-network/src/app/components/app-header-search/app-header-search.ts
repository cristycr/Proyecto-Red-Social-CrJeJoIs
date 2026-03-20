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
  private retriedUsersLoadWithExtendedFields = false;

  @ViewChild('userSearchContainer') private userSearchContainer?: ElementRef<HTMLDivElement>;

  protected readonly searchQuery = signal('');
  protected readonly usersLoading = signal(false);
  protected readonly usersLoadError = signal('');
  protected readonly searchOpen = signal(false);
  protected readonly allUsers = signal<GetUserDto[]>([]);
  protected readonly filteredUsers = computed(() => {
    const query = this.normalizeSearchValue(this.searchQuery());

    if (!query) {
      return [];
    }

    return this.allUsers()
      .filter((user) => this.buildNormalizedUserSearchText(user).includes(query))
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
    await this.ensureUsersLoadedWithExtendedFields();
  }

  protected async onSearchFocus(): Promise<void> {
    if (this.searchQuery().trim().length > 0) {
      this.searchOpen.set(true);
    }

    await this.ensureUsersLoadedWithExtendedFields();
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
    this.retriedUsersLoadWithExtendedFields = false;
    void this.ensureUsersLoaded();
  }

  protected buildAvatarUrl(avatarPath: string | null): string {
    return this.apiService.buildAvatarUrl(avatarPath);
  }

  protected buildUserFullName(user: GetUserDto): string {
    return [user.name, user.surname1, user.surname2]
      .map((part) => part?.trim() ?? '')
      .filter((part) => part.length > 0)
      .join(' ');
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

  private async ensureUsersLoadedWithExtendedFields(): Promise<void> {
    await this.ensureUsersLoaded();

    if (!this.shouldRetryUsersLoadWithExtendedFields()) {
      return;
    }

    this.retriedUsersLoadWithExtendedFields = true;
    this.usersRequested = false;
    await this.ensureUsersLoaded();
  }

  private shouldRetryUsersLoadWithExtendedFields(): boolean {
    if (this.retriedUsersLoadWithExtendedFields || this.usersLoading()) {
      return false;
    }

    const users = this.allUsers();

    if (users.length === 0) {
      return false;
    }

    return users.every(
      (user) =>
        !user.name?.trim() &&
        !user.surname1?.trim() &&
        !user.surname2?.trim()
    );
  }

  private buildNormalizedUserSearchText(user: GetUserDto): string {
    return this.normalizeSearchValue(
      [user.nickname, user.name, user.surname1, user.surname2]
        .map((part) => part?.trim() ?? '')
        .filter((part) => part.length > 0)
        .join(' ')
    );
  }

  private normalizeSearchValue(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('es-ES')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}