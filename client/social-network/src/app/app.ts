import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  protected readonly title = signal('social-network');
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly isAdmin = this.authService.isAdmin;

  ngOnInit() {
    // Cargamos el JWT del localStorage al iniciar la app
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      this.authService.setJwt(jwt);
    }
  }
}
