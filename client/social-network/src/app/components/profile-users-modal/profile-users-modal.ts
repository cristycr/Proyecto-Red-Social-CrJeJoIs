import { Component, computed, input, output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

type ProfileModalUser = {
  id: number;
  nickname: string;
  avatarUrl: string;
  fullName: string;
};

@Component({
  selector: 'app-profile-users-modal',
  imports: [RouterModule],
  templateUrl: './profile-users-modal.html',
  styleUrl: './profile-users-modal.css',
})
export class ProfileUsersModal {
  readonly open = input(false);
  readonly title = input('Usuarios');
  readonly loading = input(false);
  readonly loadingMessage = input('Cargando usuarios...');
  readonly errorMessage = input('');
  readonly emptyMessage = input('No hay usuarios para mostrar.');
  readonly users = input<ProfileModalUser[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly filteredUsers = computed(() => {
    const users = this.users();
    const query = this.normalizeSearchValue(this.searchQuery());

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      this.normalizeSearchValue(`${user.nickname} ${user.fullName}`).includes(query)
    );
  });

  readonly close = output<void>();

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchQuery.set(target?.value ?? '');
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  protected onUserClick(): void {
    this.closeModal();
  }

  protected onCloseClick(): void {
    this.closeModal();
  }

  private closeModal(): void {
    this.searchQuery.set('');
    this.close.emit();
  }

  private normalizeSearchValue(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('es-ES')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}