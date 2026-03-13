import { Component, computed, signal } from '@angular/core';

type UserRole = 'admin' | 'user';

type AdminUserRow = {
  id: number;
  nickname: string;
  email: string;
  avatarPath?: string | null;
  role: UserRole;
};

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  protected readonly users = signal<AdminUserRow[]>([
    {
      id: 1,
      nickname: 'rootfire',
      email: 'rootfire@socialnet.dev',
      avatarPath: null,
      role: 'admin',
    },
    {
      id: 2,
      nickname: 'lia_code',
      email: 'lia.code@mail.com',
      avatarPath: null,
      role: 'user',
    },
    {
      id: 3,
      nickname: 'neo89',
      email: 'neo89@socialhub.com',
      avatarPath: null,
      role: 'user',
    },
    {
      id: 4,
      nickname: 'nightowl',
      email: 'nightowl@socialhub.com',
      avatarPath: null,
      role: 'admin',
    },
    {
      id: 5,
      nickname: 'pixelcat',
      email: 'pixelcat@mail.com',
      avatarPath: null,
      role: 'user',
    },
    {
      id: 6,
      nickname: 'aura_dev',
      email: 'aura.dev@mail.com',
      avatarPath: null,
      role: 'user',
    },
  ]);

  protected readonly selectedUserForDeletion = signal<AdminUserRow | null>(null);
  protected readonly deleteNicknameInput = signal('');
  protected readonly actionMessage = signal('');

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

  protected onRoleChange(userId: number, event: Event): void {
    const target = event.target as HTMLSelectElement | null;

    if (!target) {
      return;
    }

    const selectedRole: UserRole = target.value === 'admin' ? 'admin' : 'user';

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

    const editedUser = this.users().find((user) => user.id === userId);

    if (editedUser) {
      this.actionMessage.set(
        `Rol actualizado localmente: ${editedUser.nickname} ahora es ${selectedRole}.`
      );
    }
  }

  protected openDeleteModal(user: AdminUserRow): void {
    this.selectedUserForDeletion.set(user);
    this.deleteNicknameInput.set('');
  }

  protected closeDeleteModal(): void {
    this.selectedUserForDeletion.set(null);
    this.deleteNicknameInput.set('');
  }

  protected onDeleteNicknameInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.deleteNicknameInput.set(target?.value ?? '');
  }

  protected confirmDeleteUser(): void {
    const selectedUser = this.selectedUserForDeletion();

    if (!selectedUser || !this.canConfirmDeletion()) {
      return;
    }

    this.users.update((users) =>
      users.filter((user) => user.id !== selectedUser.id)
    );

    this.actionMessage.set(
      `Usuario eliminado localmente: ${selectedUser.nickname}.`
    );

    this.closeDeleteModal();
  }

  protected onModalOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDeleteModal();
    }
  }

}
