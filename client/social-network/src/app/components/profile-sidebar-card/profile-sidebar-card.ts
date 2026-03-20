import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-sidebar-card',
  imports: [RouterModule],
  templateUrl: './profile-sidebar-card.html',
  styleUrl: './profile-sidebar-card.css',
})
export class ProfileSidebarCard {
  readonly profileImage = input.required<string>();
  readonly nickname = input.required<string>();
  readonly biography = input('');
  readonly followers = input(0);
  readonly followeds = input(0);
  readonly isOwnProfile = input(true);
  readonly isFollowingProfile = input(false);
  readonly followActionLoading = input(false);
  readonly followActionError = input('');

  readonly openFollowers = output<void>();
  readonly openFolloweds = output<void>();
  readonly followAction = output<void>();
  readonly logout = output<void>();
}