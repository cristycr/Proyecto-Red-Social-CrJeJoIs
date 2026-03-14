import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { CreatePostBtn } from '../../components/create-post-btn/create-post-btn';
import { ApiService } from '../../services/api';
import { GetUserDto } from '../../models/get-user-dto';
import { Post } from '../../models/post';
import { ProfileSidebarCard } from '../../components/profile-sidebar-card/profile-sidebar-card';
import { ProfilePostsSection } from '../../components/profile-posts-section/profile-posts-section';
import { ProfileUsersModal } from '../../components/profile-users-modal/profile-users-modal';
import { ToastService } from '../../services/toast';

type UserListItem = {
  id: number;
  nickname: string;
  avatarUrl: string;
  fullName: string;
};

@Component({
  selector: 'app-profile',
  imports: [
    CreatePostBtn,
    ProfileSidebarCard,
    ProfilePostsSection,
    ProfileUsersModal,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly nickname = signal('Usuario');
  protected readonly profileImage = signal('/assets/images/avatar-default.png');
  protected readonly biography = signal('');
  protected readonly followers = signal(0);
  protected readonly followeds = signal(0);
  protected readonly isOwnProfile = signal(true);
  protected readonly isFollowingProfile = signal(false);
  protected readonly followActionLoading = signal(false);
  protected readonly followActionError = signal('');
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly usersModalOpen = signal(false);
  protected readonly usersModalLoading = signal(false);
  protected readonly usersModalError = signal('');
  protected readonly usersModalTitle = signal('Seguidos');
  protected readonly usersModalLoadingMessage = signal('Cargando seguidos...');
  protected readonly usersModalEmptyMessage = signal('Este perfil no sigue a nadie aun.');
  protected readonly modalUsers = signal<UserListItem[]>([]);
  protected readonly userPosts = signal<Post[]>([]);
  protected readonly postsLoading = signal(true);
  protected readonly postsErrorMessage = signal('');
  protected readonly postDeleteError = signal('');
  protected readonly deletePostModalOpen = signal(false);
  protected readonly postPendingDeletion = signal<Post | null>(null);
  protected readonly deletePostConfirmationMessage =
    '¿Seguro que quieres eliminar esta publicación? Esta acción no se puede deshacer.';
  protected readonly deletingPostIds = signal<number[]>([]);
  protected readonly reversePostsOrder = signal(false);
  protected readonly postsPerPage = signal(10);
  protected readonly currentPostsPage = signal(1);
  protected readonly totalPostsPages = computed(() => {
    const totalPosts = this.userPosts().length;
    const perPage = this.postsPerPage();

    if (totalPosts === 0) {
      return 1;
    }

    return Math.ceil(totalPosts / perPage);
  });
  protected readonly orderedUserPosts = computed(() => {
    const posts = this.userPosts();

    return this.reversePostsOrder() ? [...posts].reverse() : posts;
  });
  protected readonly paginatedUserPosts = computed(() => {
    const posts = this.orderedUserPosts();
    const perPage = this.postsPerPage();
    const startIndex = (this.currentPostsPage() - 1) * perPage;

    return posts.slice(startIndex, startIndex + perPage);
  });
  protected readonly canDeletePostFn = (post: Post): boolean =>
    this.canDeletePost(post);
  protected readonly isDeletingPostFn = (postId: number): boolean =>
    this.isDeletingPost(postId);
  protected readonly formatPostDateFn = (dateValue: Date | string): string =>
    this.formatPostDate(dateValue);

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

    this.followActionLoading.set(false);
    this.followActionError.set('');

    if (!requestedUserId || Number.isNaN(requestedUserId)) {
      this.isOwnProfile.set(true);
      this.isFollowingProfile.set(false);
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
        this.userPosts.set([]);
        this.postsLoading.set(false);
        this.postsErrorMessage.set('No se pudieron cargar las publicaciones del usuario.');
        this.currentPostsPage.set(1);
        this.loading.set(false);
      }
      return;
    }

    if (requestedUserId === currentUserId) {
      this.profileUserId = currentUserId;
      this.isFollowingProfile.set(false);
      await this.router.navigate(['/profile']);
      return;
    }

    this.profileUserId = requestedUserId;
    this.isOwnProfile.set(false);
    this.isFollowingProfile.set(false);

    await Promise.allSettled([
      this.loadProfile(requestedUserId),
      this.loadFollowStatus(requestedUserId, currentUserId),
    ]);
  }

  private async loadFollowStatus(
    profileUserId: number,
    currentUserId: number | null
  ): Promise<void> {
    if (!currentUserId || currentUserId === profileUserId) {
      this.isFollowingProfile.set(false);
      return;
    }

    try {
      const followedUsers = await this.api.getFollowedUsers(currentUserId);

      this.isFollowingProfile.set(
        followedUsers.some((user) => user.id === profileUserId)
      );
    } catch {
      this.isFollowingProfile.set(false);
    }
  }

  protected async onFollowButtonClick(): Promise<void> {
    const followedId = this.profileUserId;

    if (!followedId || this.isOwnProfile()) {
      return;
    }

    const followerId = this.auth.currentUserId();

    if (!followerId || !this.auth.jwt) {
      await this.router.navigate(['/login'], {
        queryParams: { redirectTo: this.router.url },
      });
      return;
    }

    if (followerId === followedId) {
      return;
    }

    this.followActionLoading.set(true);
    this.followActionError.set('');

    try {
      if (this.isFollowingProfile()) {
        await this.api.unfollowUser(followerId, followedId);
        this.isFollowingProfile.set(false);
        this.followers.update((count) => Math.max(0, count - 1));
      } else {
        await this.api.followUser({ followerId, followedId });
        this.isFollowingProfile.set(true);
        this.followers.update((count) => count + 1);
      }
    } catch (err: any) {
      const backendError =
        typeof err?.error === 'string'
          ? err.error
          : err?.error?.error ||
            err?.error?.message ||
            err?.message;

      this.followActionError.set(
        backendError || 'No se pudo actualizar el seguimiento.'
      );
    } finally {
      this.followActionLoading.set(false);
    }
  }

  private async loadProfile(userId: number): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    this.postsLoading.set(true);
    this.postsErrorMessage.set('');
    this.postDeleteError.set('');
    this.deletePostModalOpen.set(false);
    this.postPendingDeletion.set(null);
    this.deletingPostIds.set([]);
    this.reversePostsOrder.set(false);
    this.userPosts.set([]);
    this.currentPostsPage.set(1);

    const [profileResult, postsResult] = await Promise.allSettled([
      this.api.getUserProfileById(userId),
      this.api.getPostsByUserId(userId),
    ]);

    if (profileResult.status === 'fulfilled') {
      const profile = profileResult.value;

      this.nickname.set(profile?.nickname ?? 'Usuario');
      this.profileImage.set(this.buildAvatarUrl(profile?.avatarPath ?? null));

      this.biography.set(profile?.biography ?? '');
      this.followers.set(profile?.followers ?? profile?.followerCount ?? 0);
      this.followeds.set(profile?.followeds ?? profile?.followedCount ?? 0);
    } else {
      this.errorMessage.set('No se pudo cargar el perfil del usuario.');
      this.nickname.set('Usuario');
      this.profileImage.set('/assets/images/avatar-default.png');
      this.biography.set('');
      this.followers.set(0);
      this.followeds.set(0);
    }

    if (postsResult.status === 'fulfilled') {
      this.userPosts.set(postsResult.value);
    } else {
      this.postsErrorMessage.set('No se pudieron cargar las publicaciones del usuario.');
    }

    this.loading.set(false);
    this.postsLoading.set(false);
  }

  protected canDeletePost(post: Post): boolean {
    const jwtUserId = this.auth.currentUserId();
    const postUserId = this.parsePostUserId(post.userId);

    return (
      this.isOwnProfile() &&
      !!this.auth.jwt &&
      jwtUserId !== null &&
      postUserId !== null &&
      jwtUserId === postUserId
    );
  }

  protected isDeletingPost(postId: number): boolean {
    return this.deletingPostIds().includes(postId);
  }

  protected onDeletePost(post: Post): void {
    this.postDeleteError.set('');

    if (!this.canDeletePost(post)) {
      const message = 'No tienes permisos para eliminar esta publicación.';
      this.postDeleteError.set(message);
      this.toast.showError(message);
      return;
    }

    if (this.isDeletingPost(post.id)) {
      return;
    }

    this.postPendingDeletion.set(post);
    this.deletePostModalOpen.set(true);
  }

  protected onDeletePostModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDeletePostModal();
    }
  }

  protected closeDeletePostModal(): void {
    this.deletePostModalOpen.set(false);
    this.postPendingDeletion.set(null);
  }

  protected async confirmDeletePost(): Promise<void> {
    const post = this.postPendingDeletion();

    if (!post) {
      this.closeDeletePostModal();
      return;
    }

    this.closeDeletePostModal();

    if (!this.canDeletePost(post)) {
      const message = 'No tienes permisos para eliminar esta publicación.';
      this.postDeleteError.set(message);
      this.toast.showError(message);
      return;
    }

    if (this.isDeletingPost(post.id)) {
      return;
    }

    await this.deletePost(post);
  }

  private async deletePost(post: Post): Promise<void> {
    this.setPostDeleting(post.id, true);

    try {
      await this.api.deletePost(post.id);

      this.userPosts.update((posts) =>
        posts.filter((currentPost) => currentPost.id !== post.id)
      );

      const maxAvailablePage = this.totalPostsPages();

      if (this.currentPostsPage() > maxAvailablePage) {
        this.currentPostsPage.set(maxAvailablePage);
      }

      this.toast.showSuccess('Publicación eliminada con éxito.');
    } catch (err: any) {
      const message = this.extractBackendError(
        err,
        'No se pudo eliminar la publicación.'
      );

      this.postDeleteError.set(message);
      this.toast.showError(message);
    } finally {
      this.setPostDeleting(post.id, false);
    }
  }

  protected onPostsPerPageSelected(selectedValue: number): void {
    this.postsPerPage.set(selectedValue);
    this.currentPostsPage.set(1);
  }

  protected togglePostsOrder(): void {
    this.reversePostsOrder.update((isReversed) => !isReversed);
    this.currentPostsPage.set(1);
    this.scrollToTop();
  }

  protected goToPreviousPostsPage(): void {
    if (this.currentPostsPage() <= 1) {
      return;
    }

    this.currentPostsPage.update((page) => page - 1);
    this.scrollToTop();
  }

  protected goToNextPostsPage(): void {
    const totalPages = this.totalPostsPages();

    if (this.currentPostsPage() >= totalPages) {
      return;
    }

    this.currentPostsPage.update((page) => page + 1);
    this.scrollToTop();
  }

  protected goToPostsPage(page: number): void {
    const targetPage = Math.floor(page);
    const totalPages = this.totalPostsPages();

    if (
      targetPage < 1 ||
      targetPage > totalPages ||
      targetPage === this.currentPostsPage()
    ) {
      return;
    }

    this.currentPostsPage.set(targetPage);
    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
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
          fullName: this.buildUserFullName(user),
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

  protected formatPostDate(dateValue: Date | string): string {
    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
  }

  private setPostDeleting(postId: number, isDeleting: boolean): void {
    this.deletingPostIds.update((postIds) => {
      if (isDeleting) {
        return postIds.includes(postId) ? postIds : [...postIds, postId];
      }

      return postIds.filter((id) => id !== postId);
    });
  }

  private parsePostUserId(userId: string | number | null | undefined): number | null {
    const parsedId = Number(userId);

    if (Number.isNaN(parsedId)) {
      return null;
    }

    return parsedId;
  }

  private extractBackendError(err: any, fallbackMessage: string): string {
    return (
      (typeof err?.error === 'string' ? err.error : null) ||
      err?.error?.error ||
      err?.error?.message ||
      err?.message ||
      fallbackMessage
    );
  }

  private buildUserFullName(user: GetUserDto): string {
    return [user.name, user.surname1, user.surname2]
      .map((part) => part?.trim() ?? '')
      .filter((part) => part.length > 0)
      .join(' ');
  }

  private buildAvatarUrl(avatarPath: string | null): string {
    return this.api.buildAvatarUrl(avatarPath);
  }

  logout() {
    this.auth.jwt = null;
    localStorage.removeItem('jwt');
    this.router.navigate(['/landing']);
  }
}