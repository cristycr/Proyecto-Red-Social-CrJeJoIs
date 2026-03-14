import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

type ProfileModalUser = {
  id: number;
  nickname: string;
  avatarUrl: string;
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

  readonly close = output<void>();

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  protected onUserClick(): void {
    this.close.emit();
  }
}