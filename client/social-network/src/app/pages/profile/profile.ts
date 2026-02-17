import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { CreatePostBtn } from '../../components/create-post-btn/create-post-btn';

@Component({
  selector: 'app-profile',
  imports: [CreatePostBtn],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  
  protected readonly nickname = this.auth.nickname;
  protected readonly profileImage = this.auth.profileImage;

  logout() {
    this.auth.jwt = null;
    localStorage.removeItem('jwt');
    this.router.navigate(['/landing']);
  }
}
