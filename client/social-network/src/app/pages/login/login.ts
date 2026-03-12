import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from "@angular/router";
import { AuthRequest } from '../../models/auth-request';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  // Variables del formulario de login
  nickname: string = '';
  password: string = '';
  rememberMeChecked: boolean = false;

  errorMessage = signal('');
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Método del submit del formulario de login
  async submit() {

    this.errorMessage.set('');

    const authData: AuthRequest = {
      nickname: this.nickname,
      password: this.password
    };

    try {

      const result = await this.authService.login(
        authData,
        this.rememberMeChecked
      );

      if (result === true) {

        const redirectTo =
          this.route.snapshot.queryParams['redirectTo'] || '/feed';

        this.router.navigateByUrl(redirectTo);
        return;
      }

      this.errorMessage.set('Usuario o contraseña incorrectos.');

    } catch (err: any) {

      const backendError =
        typeof err?.error === 'string'
          ? err.error
          : err?.error?.error ||
            err?.error?.message ||
            err?.message;

      this.errorMessage.set(
        backendError || 'Error de conexión con el servidor.'
      );
    }
  }

}