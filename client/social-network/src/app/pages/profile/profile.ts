import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { CreatePostBtn } from '../../components/create-post-btn/create-post-btn';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-profile',
  imports: [CreatePostBtn],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  protected readonly nickname = signal('Usuario');
  protected readonly profileImage = signal('/assets/images/avatar-default.png');
  protected readonly biography = signal('');
  protected readonly followers = signal(0);
  protected readonly followeds = signal(0);
  protected readonly isOwnProfile = signal(true);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    const routeId = this.route.snapshot.paramMap.get('id');
    const requestedUserId = routeId ? Number(routeId) : null;
    const currentUserId = this.auth.currentUserId();

    if (!requestedUserId || Number.isNaN(requestedUserId) || requestedUserId === currentUserId) {
      this.loadOwnProfileFromJwt();
      return;
    }

    this.isOwnProfile.set(false);
    await this.loadExternalProfile(requestedUserId);
  }

  private loadOwnProfileFromJwt(): void {
    this.isOwnProfile.set(true);
    this.nickname.set(this.auth.nickname());
    this.profileImage.set(this.auth.profileImage());
    this.biography.set(this.auth.biography());
    this.followers.set(0);
    this.followeds.set(0);
    this.errorMessage.set('');
    this.loading.set(false);
  }

  private async loadExternalProfile(userId: number): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const profile = await this.api.getUserProfileById(userId);

      this.nickname.set(profile?.nickname ?? 'Usuario');
      this.profileImage.set(profile?.avatarPath || '/assets/images/avatar-default.png');
      this.biography.set(profile?.biography ?? '');
      this.followers.set(profile?.followers ?? profile?.followersCount ?? 0);
      this.followeds.set(profile?.followeds ?? profile?.followedsCount ?? 0);
    } catch {
      this.errorMessage.set('No se pudo cargar el perfil del usuario.');
    } finally {
      this.loading.set(false);
    }
  }

  logout() {
    this.auth.jwt = null;
    localStorage.removeItem('jwt');
    this.router.navigate(['/landing']);
  }
}
