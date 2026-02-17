import { Component } from '@angular/core';
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
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    // Limpiar JWT en memoria
    this.auth.jwt = null;
    // Limpiar JWT en ApiService si es necesario
    if (this.auth['api']) {
      this.auth['api'].jwt = null;
    }
    // Limpiar JWT en localStorage
    localStorage.removeItem('jwt');
    // Redirigir al landing
    this.router.navigate(['/landing']);
  }
}
