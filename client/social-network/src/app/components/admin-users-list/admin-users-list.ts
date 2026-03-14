import { Component, input, output } from '@angular/core';
import { UserRole } from '../../models/get-admin-dto';
import { AdminUserRow } from '../../models/admin-user-row';

@Component({
  selector: 'app-admin-users-list',
  imports: [],
  templateUrl: './admin-users-list.html',
  styleUrl: './admin-users-list.css',
})
export class AdminUsersList {
  readonly users = input<AdminUserRow[]>([]);
  readonly isRoleUpdating = input<(userId: number) => boolean>(() => false);
  readonly isDeletingUser = input<(userId: number) => boolean>(() => false);

  readonly roleChange = output<{ userId: number; role: UserRole }>();
  readonly deleteUser = output<AdminUserRow>();

  protected onRoleSelectChange(userId: number, event: Event): void {
    const target = event.target as HTMLSelectElement | null;

    if (!target) {
      return;
    }

    this.roleChange.emit({
      userId,
      role: this.normalizeRole(target.value),
    });
  }

  private normalizeRole(role: string): UserRole {
    return role?.trim().toLowerCase() === 'admin' ? 'admin' : 'user';
  }
}