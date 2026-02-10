import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { Post } from './models/post';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('social-network');

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Cargamos el JWT del localStorage al iniciar la app
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      this.authService.setJwt(jwt);
    }
  }
}
