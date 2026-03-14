import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { UserRole } from '../../models/get-admin-dto';
import { PutUserRoleDto } from '../../models/put-user-role-dto';
import { ApiService } from '../../services/api';

type AdminUserRow = {
  id: number;
  nickname: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
};

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly users = signal<AdminUserRow[]>([]);
  protected readonly loadingUsers = signal(false);
  protected readonly loadError = signal('');

  protected readonly selectedUserForDeletion = signal<AdminUserRow | null>(null);
  protected readonly deleteNicknameInput = signal('');
  protected readonly actionMessage = signal('');
  protected readonly updatingRoleIds = signal<number[]>([]);
  protected readonly deletingUserId = signal<number | null>(null);

  protected readonly totalUsers = computed(() => this.users().length);
  protected readonly totalAdmins = computed(
    () => this.users().filter((user) => user.role === 'admin').length
  );
  protected readonly totalStandardUsers = computed(
    () => this.totalUsers() - this.totalAdmins()
  );

  protected readonly canConfirmDeletion = computed(() => {
    const selectedUser = this.selectedUserForDeletion();

    if (!selectedUser) {
      return false;
    }

    return this.deleteNicknameInput().trim() === selectedUser.nickname;
  });

  ngOnInit(): void {
    void this.loadUsers();
  }

  protected reloadUsers(): void {
    void this.loadUsers();
  }

  protected isRoleUpdating(userId: number): boolean {
    return this.updatingRoleIds().includes(userId);
  }

  protected isDeletingUser(userId: number): boolean {
    return this.deletingUserId() === userId;
  }

  protected async onRoleChange(userId: number, event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement | null;

    if (!target || this.isRoleUpdating(userId) || this.isDeletingUser(userId)) {
      return;
    }

    const selectedRole = this.normalizeRole(target.value);
    const currentUser = this.users().find((user) => user.id === userId);

    if (!currentUser || currentUser.role === selectedRole) {
      target.value = currentUser?.role ?? 'user';
      return;
    }

    const dto: PutUserRoleDto = {
      role: selectedRole,
    };

    this.markRoleUpdating(userId, true);

    try {
      await this.api.updateUserRole(userId, dto);

      this.users.update((users) =>
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: selectedRole,
              }
            : user
        )
      );

      this.actionMessage.set(
        `Rol actualizado: ${currentUser.nickname} ahora es ${selectedRole}.`
      );
    } catch (err: any) {
      target.value = currentUser.role;
      this.actionMessage.set(
        this.extractBackendError(err, 'No se pudo actualizar el rol del usuario.')
      );
    } finally {
      this.markRoleUpdating(userId, false);
    }
  }

  protected openDeleteModal(user: AdminUserRow): void {
    if (this.deletingUserId() !== null) {
      return;
    }

    this.selectedUserForDeletion.set(user);
    this.deleteNicknameInput.set('');
  }

  protected closeDeleteModal(force: boolean = false): void {
    if (!force && this.deletingUserId() !== null) {
      return;
    }

    this.selectedUserForDeletion.set(null);
    this.deleteNicknameInput.set('');
  }

  protected onDeleteNicknameInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.deleteNicknameInput.set(target?.value ?? '');
  }

  protected async confirmDeleteUser(): Promise<void> {
    const selectedUser = this.selectedUserForDeletion();

    if (
      !selectedUser ||
      !this.canConfirmDeletion() ||
      this.deletingUserId() !== null
    ) {
      return;
    }

    this.deletingUserId.set(selectedUser.id);

    try {
      await this.api.deleteUserByAdmin(selectedUser.id);

      this.users.update((users) =>
        users.filter((user) => user.id !== selectedUser.id)
      );

      this.actionMessage.set(`Usuario eliminado: ${selectedUser.nickname}.`);
      this.closeDeleteModal(true);
    } catch (err: any) {
      this.actionMessage.set(
        this.extractBackendError(err, 'No se pudo eliminar el usuario.')
      );
    } finally {
      this.deletingUserId.set(null);
    }
  }

  protected onModalOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDeleteModal();
    }
  }

  private async loadUsers(): Promise<void> {
    this.loadingUsers.set(true);
    this.loadError.set('');
    this.actionMessage.set('');

    try {
      const users = await this.api.getAdminUsers();

      this.users.set(
        users.map((user) => ({
          id: user.id,
          nickname: user.nickname,
          avatarUrl: this.buildAvatarUrl(user.avatarPath),
          email: user.email,
          role: this.normalizeRole(user.role),
        }))
      );
    } catch (err: any) {
      this.users.set([]);
      this.loadError.set(
        this.extractBackendError(err, 'No se pudo cargar la lista de usuarios.')
      );
    } finally {
      this.loadingUsers.set(false);
    }
  }

  private markRoleUpdating(userId: number, inProgress: boolean): void {
    this.updatingRoleIds.update((currentIds) => {
      if (inProgress) {
        if (currentIds.includes(userId)) {
          return currentIds;
        }

        return [...currentIds, userId];
      }

      return currentIds.filter((id) => id !== userId);
    });
  }

  private normalizeRole(role: string | null | undefined): UserRole {
    return role?.trim().toLowerCase() === 'admin' ? 'admin' : 'user';
  }

  private buildAvatarUrl(avatarPath: string | null | undefined): string {
    return this.api.buildAvatarUrl(avatarPath);
  }

  private extractBackendError(err: any, fallback: string): string {
    const backendError =
      typeof err?.error === 'string'
        ? err.error
        : err?.error?.error ||
          err?.error?.message ||
          err?.message;

    if (!backendError || typeof backendError !== 'string') {
      return fallback;
    }

    const cleanError = backendError.trim();
    return cleanError.length > 0 ? cleanError : fallback;
  }
}
