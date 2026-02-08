import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthRequest } from '../../models/auth-request';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login implements OnInit, OnDestroy {

  // Variables del formulario de login
  nickname: string = '';
  password: string = '';
  jwt: string = '';

  // Inyectamos el servicio de autenticación para el login
  constructor(private authService: AuthService) {}

  // Método del submit del formulario de login
  async submit() {
    const authData: AuthRequest = {
      nickname: this.nickname,
      password: this.password
    };

    const result = await this.authService.login(authData);

    // Si el login es correcto, se guarda el JWT en el servicio de autenticación
    if (result.success) {
      this.jwt = result.data.accessToken;
      // TO DO: Redirigir a la página del feed
    } else {
      alert('El usuario o la contraseña son incorrectos');
    }
  }

  ngOnInit() {
    document.body.classList.add('login-background');
  }

  ngOnDestroy() {
    document.body.classList.remove('login-background');
  }
}
