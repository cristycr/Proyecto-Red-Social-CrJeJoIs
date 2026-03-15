import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  input,
  output,
  signal,
  inject,
} from '@angular/core';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-profile-avatar-panel',
  imports: [],
  templateUrl: './profile-avatar-panel.html',
  styleUrl: './profile-avatar-panel.css',
})
export class ProfileAvatarPanel {
  readonly avatarUrl = input.required<string>();
  readonly nickname = input('Usuario');
  readonly actionLoading = input(false);
  readonly actionError = input('');
  readonly hasPrivateData = input(false);

  readonly avatarSelected = output<File>();
  readonly removeAvatarRequested = output<void>();

  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  protected readonly avatarMenuOpen = signal(false);

  private readonly toast = inject(ToastService);

  @ViewChild('avatarInput') private avatarInput?: ElementRef<HTMLInputElement>;
  @ViewChild('avatarMenuContainer')
  private avatarMenuContainer?: ElementRef<HTMLDivElement>;

  protected toggleAvatarMenu(event: MouseEvent): void {
    event.stopPropagation();

    if (this.actionLoading()) {
      return;
    }

    this.avatarMenuOpen.update((isOpen) => !isOpen);
  }

  protected triggerAvatarInput(event: MouseEvent): void {
    event.stopPropagation();
    this.avatarMenuOpen.set(false);
    this.avatarInput?.nativeElement.click();
  }

    protected onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!this.allowedImageTypes.includes(file.type)) {
      this.toast.showError(
        'Formato de imagen no permitido. Solo se permiten JPG, PNG o GIF.'
      );
      input.value = '';
      return;
    }

    this.avatarSelected.emit(file);
    this.avatarMenuOpen.set(false);
    input.value = '';
  }

  protected requestRemoveAvatar(event: MouseEvent): void {
    event.stopPropagation();

    if (this.actionLoading()) {
      return;
    }

    this.avatarMenuOpen.set(false);
    this.removeAvatarRequested.emit();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.avatarMenuOpen()) {
      return;
    }

    const container = this.avatarMenuContainer?.nativeElement;
    const target = event.target as Node | null;

    if (!container || !target || !container.contains(target)) {
      this.avatarMenuOpen.set(false);
    }
  }
}