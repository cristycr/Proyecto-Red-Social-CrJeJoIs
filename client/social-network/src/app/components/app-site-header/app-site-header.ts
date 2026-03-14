import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLinkWithHref } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { AppHeaderSearch } from '../app-header-search/app-header-search';

@Component({
  selector: 'app-site-header',
  imports: [RouterLinkWithHref, AppHeaderSearch],
  templateUrl: './app-site-header.html',
  styleUrl: './app-site-header.css',
})
export class AppSiteHeader {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  @ViewChild('profileMenuContainer') private profileMenuContainer?: ElementRef<HTMLLIElement>;

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly isAdmin = this.authService.isAdmin;
  protected readonly profileMenuOpen = signal(false);
  protected readonly currentUserNickname = this.authService.nickname;
  protected readonly currentUserAvatar = computed(() =>
    this.buildAvatarUrl(this.authService.profileImage())
  );

  protected toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.profileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  protected buildAvatarUrl(avatarPath: string | null): string {
    return this.apiService.buildAvatarUrl(avatarPath);
  }

  protected logout(): void {
    this.closeProfileMenu();
    this.authService.jwt = null;
    localStorage.removeItem('jwt');
    void this.router.navigate(['/landing']);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const profileMenuContainer = this.profileMenuContainer?.nativeElement;
    const target = event.target as Node | null;

    if (!target) {
      return;
    }

    if (profileMenuContainer && !profileMenuContainer.contains(target)) {
      this.profileMenuOpen.set(false);
    }
  }
}