import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CreatePostBtn } from '../../components/create-post-btn/create-post-btn';
import { ApiService } from '../../services/api';
import { GetUserDto } from '../../models/get-user-dto';

type UserListItem = {
  id: number;
  nickname: string;
  avatarUrl: string;
};

@Component({
  selector: 'app-profile',
  imports: [CreatePostBtn, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly nickname = signal('Usuario');
  protected readonly profileImage = signal('/assets/images/avatar-default.png');
  protected readonly biography = signal('');
  protected readonly followers = signal(0);
  protected readonly followeds = signal(0);
  protected readonly isOwnProfile = signal(true);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly usersModalOpen = signal(false);
  protected readonly usersModalLoading = signal(false);
  protected readonly usersModalError = signal('');
  protected readonly usersModalTitle = signal('Seguidos');
  protected readonly usersModalLoadingMessage = signal('Cargando seguidos...');
  protected readonly usersModalEmptyMessage = signal('Este perfil no sigue a nadie aun.');
  protected readonly modalUsers = signal<UserListItem[]>([]);

  private profileUserId: number | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        void this.handleProfileRouteChange(params.get('id'));
      });
  }

  private async handleProfileRouteChange(routeId: string | null): Promise<void> {
    const requestedUserId = routeId ? Number(routeId) : null;
    const currentUserId = this.auth.currentUserId();

    if (!requestedUserId || Number.isNaN(requestedUserId)) {
      this.isOwnProfile.set(true);
      this.profileUserId = currentUserId;

      if (currentUserId) {
        await this.loadProfile(currentUserId);
      } else {
        this.errorMessage.set('No se pudo identificar el usuario autenticado.');
        this.nickname.set('Usuario');
        this.profileImage.set('/assets/images/avatar-default.png');
        this.biography.set('');
        this.followers.set(0);
        this.followeds.set(0);
        this.loading.set(false);
      }
      return;
    }

    if (requestedUserId === currentUserId) {
      this.profileUserId = currentUserId;
      await this.router.navigate(['/profile']);
      return;
    }

    this.profileUserId = requestedUserId;
    this.isOwnProfile.set(false);
    await this.loadProfile(requestedUserId);
  }

  private async loadProfile(userId: number): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const profile = await this.api.getUserProfileById(userId);

      this.nickname.set(profile?.nickname ?? 'Usuario');
      this.profileImage.set(this.buildAvatarUrl(profile?.avatarPath ?? null));

      this.biography.set(profile?.biography ?? '');
      this.followers.set(profile?.followers ?? profile?.followerCount ?? 0);
      this.followeds.set(profile?.followeds ?? profile?.followedCount ?? 0);
    } catch {
      this.errorMessage.set('No se pudo cargar el perfil del usuario.');
    } finally {
      this.loading.set(false);
    }
  }

  async openFollowersModal(): Promise<void> {
    await this.openUsersModal({
      title: 'Seguidores',
      loadingMessage: 'Cargando seguidores...',
      emptyMessage: 'Este perfil no tiene seguidores aun.',
      errorMessage: 'No se pudo cargar la lista de seguidores.',
      fetchUsers: (userId) => this.api.getFollowerUsers(userId),
    });
  }

  async openFollowedsModal(): Promise<void> {
    await this.openUsersModal({
      title: 'Seguidos',
      loadingMessage: 'Cargando seguidos...',
      emptyMessage: 'Este perfil no sigue a nadie aun.',
      errorMessage: 'No se pudo cargar la lista de seguidos.',
      fetchUsers: (userId) => this.api.getFollowedUsers(userId),
    });
  }

  private async openUsersModal(config: {
    title: string;
    loadingMessage: string;
    emptyMessage: string;
    errorMessage: string;
    fetchUsers: (userId: number) => Promise<GetUserDto[]>;
  }): Promise<void> {
    this.usersModalTitle.set(config.title);
    this.usersModalLoadingMessage.set(config.loadingMessage);
    this.usersModalEmptyMessage.set(config.emptyMessage);

    if (!this.profileUserId) {
      this.usersModalError.set('No se pudo identificar el usuario del perfil.');
      this.modalUsers.set([]);
      this.usersModalOpen.set(true);
      return;
    }

    this.usersModalOpen.set(true);
    this.usersModalLoading.set(true);
    this.usersModalError.set('');
    this.modalUsers.set([]);

    try {
      const users = await config.fetchUsers(this.profileUserId);

      this.modalUsers.set(
        users.map((user) => ({
          id: user.id,
          nickname: user.nickname,
          avatarUrl: this.buildAvatarUrl(user.avatarPath),
        }))
      );
    } catch {
      this.usersModalError.set(config.errorMessage);
    } finally {
      this.usersModalLoading.set(false);
    }
  }

  closeUsersModal(): void {
    this.usersModalOpen.set(false);
  }

  onUsersModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeUsersModal();
    }
  }

  private buildAvatarUrl(avatarPath: string | null): string {
    const cleanAvatarPath = avatarPath?.trim();

    if (!cleanAvatarPath) {
      return '/assets/images/avatar-default.png';
    }

    return `https://localhost:7185/uploads/${cleanAvatarPath}`;
  }

  logout() {
    this.auth.jwt = null;
    localStorage.removeItem('jwt');
    this.router.navigate(['/landing']);
  }

  // Avatar
  triggerAvatarInput() {
    document.getElementById('avatarInput')?.click();
  }

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    try {
      const result = await this.api.uploadAvatar(file);
      // Usar la URL completa devuelta por el backend
      //La siguiente línea sería lo suyo arreglarla
      this.profileImage.set(
        result.avatarUrl
          ? `https://localhost:7185${result.avatarUrl}`
          : '/assets/images/avatar-default.png'
      );

      if (this.profileUserId) {
        await this.loadProfile(this.profileUserId);
      }
    } catch (err) {
      console.error('Error subiendo avatar:', err);
    }
  }

  async removeAvatar() {
    try {
      await this.api.deleteAvatar();
      this.profileImage.set('/assets/images/avatar-default.png');

      if (this.profileUserId) {
        await this.loadProfile(this.profileUserId);
      }
    } catch (err) {
      console.error('Error eliminando avatar:', err);
    }
  }
}