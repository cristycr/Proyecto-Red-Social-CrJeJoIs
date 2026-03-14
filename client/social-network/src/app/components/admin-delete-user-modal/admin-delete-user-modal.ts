import { Component, input, output } from '@angular/core';
import { AdminUserRow } from '../../models/admin-user-row';

@Component({
  selector: 'app-admin-delete-user-modal',
  imports: [],
  templateUrl: './admin-delete-user-modal.html',
  styleUrl: './admin-delete-user-modal.css',
})
export class AdminDeleteUserModal {
  readonly user = input<AdminUserRow | null>(null);
  readonly deleteNicknameInput = input('');
  readonly canConfirmDeletion = input(false);
  readonly deletingUser = input(false);

  readonly close = output<void>();
  readonly confirm = output<void>();
  readonly deleteNicknameInputChange = output<string>();

  protected onModalOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.deletingUser()) {
      this.close.emit();
    }
  }

  protected onDeleteNicknameInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.deleteNicknameInputChange.emit(target?.value ?? '');
  }
}