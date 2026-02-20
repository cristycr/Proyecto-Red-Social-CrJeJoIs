import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { AddUserDto } from '../../models/add-user-dto';

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
  fieldErrors: { [key: string]: string } = {}; // errores por campo

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
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

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
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

  isRequired(field: string): boolean {
    return ['name', 'surname1', 'nickname', 'email', 'password', 'confirmPassword'].includes(field);
  }

  getAngularError(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return `${this.getLabel(field)} es obligatorio.`;
    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      return `${this.getLabel(field)} debe tener mínimo ${min} caracteres.`;
    }
    if (control.errors['email']) return 'Correo electrónico inválido.';
    return '';
  }

  async submit() {
    // Reiniciamos errores
    this.errorMessage.set('');
    this.fieldErrors = {};

    if (this.registerForm.invalid) {
      this.errorMessage.set('Revisa los campos obligatorios o errores.');
      return;
    }

    const formValue = this.registerForm.value;
    const user: any = {
      Name: formValue.name,
      Surname1: formValue.surname1,
      Surname2: formValue.surname2 || undefined,
      Nickname: formValue.nickname,
      Email: formValue.email,
      Password: formValue.password
    };

    try {

      const result = await this.api.post<AddUserDto>('Auth/register', user);

      if (result.success) {
        this.router.navigate(['/login']);
        return;
      }

      // Procesamos errores del backend por campo

      // TODO: Comprobar si devuelve "nickname" o "email" o "null" para mostrar el mensaje deseado en el formulario
      if (result.error && typeof result.error === 'object') {
        const errorObj = result.error as Record<string, string>;
        for (const key in errorObj) {
          if (Object.prototype.hasOwnProperty.call(errorObj, key)) {
            const field = key.toLowerCase();
            if (this.registerForm.controls[field]) {
              this.fieldErrors[field] = errorObj[key];
            }
          }
        }
      } else {
        // Si es string o null/undefined, mostramos mensaje global
        this.errorMessage.set(result.error ?? 'Error al registrar usuario');
      }

    } catch {
      this.errorMessage.set('Error de conexión con el servidor.');
    }
  }
}