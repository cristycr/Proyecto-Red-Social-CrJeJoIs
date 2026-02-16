import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ApiService } from '../../services/api';
import { AddUserDto } from '../../models/add-user-dto';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf, CommonModule],
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
      // Validar duplicados
      if (await this.api.getUserByNickname(user.Nickname)) {
        this.fieldErrors['nickname'] = 'Nickname ya en uso.';
        return;
      }
      if (await this.api.getUserByEmail(user.Email)) {
        this.fieldErrors['email'] = 'Email ya en uso.';
        return;
      }

      const result = await this.api.post<AddUserDto>('users', user);

      if (result.success) {
        this.router.navigate(['/login']);
        return;
      }

      // Procesamos errores del backend
      if (result.error != null && typeof result.error === 'object') {
        const backendErrors = result.error as { [key: string]: string | string[] }; // decimos que es objeto
        for (const key of Object.keys(backendErrors)) {
          const field = key.charAt(0).toLowerCase() + key.slice(1);
          if (this.registerForm.controls[field]) {
            const value = backendErrors[key];
            this.fieldErrors[field] = Array.isArray(value) ? value[0] : String(value);
          }
        }
      } else {
        // Si es string o null/undefined, lo mostramos como mensaje global
        this.errorMessage.set(result.error ?? 'Error al registrar usuario');
      }

    } catch {
      this.errorMessage.set('Error de conexión con el servidor.');
    }
  }
}