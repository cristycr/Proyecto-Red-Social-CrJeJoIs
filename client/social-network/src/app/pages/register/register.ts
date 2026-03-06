import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { RegisterRequest } from '../../models/register-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnInit, OnDestroy {

  registerForm: FormGroup;
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname1: ['', [Validators.required, Validators.minLength(2)]],
      surname2: [''],
      nickname: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

  }

  ngOnInit() {
    document.body.classList.add('login-background');
  }

  ngOnDestroy() {
    document.body.classList.remove('login-background');
  }

  private passwordMatchValidator = (form: FormGroup) => {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;

    return password === confirm ? null : { passwordsMismatch: true };
  };

  isRequired(field: string): boolean {
    return ['name', 'surname1', 'nickname', 'email', 'password', 'confirmPassword']
      .includes(field);
  }

  getLabel(field: string): string {
    const labels: Record<string, string> = {
      name: 'Nombre',
      surname1: 'Primer apellido',
      surname2: 'Segundo apellido',
      nickname: 'Nickname',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña'
    };

    return labels[field] ?? field;
  }

  getAngularError(field: string): string {
    const control = this.registerForm.get(field);

    if (!control?.errors) return '';

    if (control.errors['required'])
      return `${this.getLabel(field)} es obligatorio.`;

    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      return `${this.getLabel(field)} debe tener mínimo ${min} caracteres.`;
    }

    if (control.errors['email'])
      return 'Correo electrónico inválido.';

    return '';
  }

  async submit() {

    this.errorMessage.set('');

    if (this.registerForm.invalid) {
      this.errorMessage.set('Revisa los campos obligatorios o errores.');
      return;
    }

    const formValue = this.registerForm.value;

    const registerData: RegisterRequest = {
      name: formValue.name,
      surname1: formValue.surname1,
      surname2: formValue.surname2 || null,
      nickname: formValue.nickname,
      email: formValue.email,
      password: formValue.password
    };

    try {

      const success = await this.authService.register(registerData);

      if (success) {
        this.router.navigate(['/login']);
        return;
      }

      this.errorMessage.set('No se pudo registrar el usuario.');

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