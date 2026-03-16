import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { SocketService } from '../../services/websocket.service';
import { AuthRequest } from '../../models/auth-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {

  loginForm: FormGroup;
  errorMessage = signal('');

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly socketService = inject(SocketService);

  constructor() {
    this.loginForm = this.fb.group({
      nickname: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  isRequired(field: string): boolean {
    return ['nickname', 'password'].includes(field);
  }

  getLabel(field: string): string {
    const labels: Record<string, string> = {
      nickname: 'Usuario',
      password: 'Contraseña',
      rememberMe: 'Mantener sesión iniciada'
    };
    return labels[field] ?? field;
  }

  getAngularError(field: string): string {
    const control = this.loginForm.get(field);
    if (!control?.errors) return '';

    if (control.errors['required'])
      return `${this.getLabel(field)} es obligatorio.`;

    return '';
  }

  async submit() {
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.errorMessage.set('Revisa los campos obligatorios o errores.');
      return;
    }

    const formValue = this.loginForm.value;
    const authData: AuthRequest = {
      nickname: formValue.nickname,
      password: formValue.password
    };
    const rememberMeChecked = formValue.rememberMe;

    try {
      const result = await this.authService.login(authData, rememberMeChecked);

      if (result === true) {
        const jwt = this.authService.jwt;
        if (jwt) this.socketService.connect(jwt);

        const redirectTo = this.route.snapshot.queryParams['redirectTo'] || '/feed';
        this.router.navigateByUrl(redirectTo);
        return;
      }

      this.errorMessage.set('Usuario o contraseña incorrectos.');
    } catch (err: any) {
      const backendError =
        typeof err?.error === 'string'
          ? err.error
          : err?.error?.error || err?.error?.message || err?.message;

      this.errorMessage.set(backendError || 'Error de conexión con el servidor.');
    }
  }
}