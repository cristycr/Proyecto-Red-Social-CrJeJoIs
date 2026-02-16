import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AddUserDto } from '../../models/add-user-dto';
import { ApiService } from '../../services/api';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnInit, OnDestroy {
  name: string = '';
  surname1: string = '';
  surname2: string = '';
  nickname: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  avatarPath: string | null = null;
  errorMessage = signal('');

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    document.body.classList.add('login-background');
  }

  ngOnDestroy() {
    document.body.classList.remove('login-background');
  }

  async submit(form: NgForm) {
    // Validación básica de contraseñas
    this.errorMessage.set('');

    if (form.invalid) {
      this.errorMessage.set('Revisa los campos obligatorios.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    try {

      // Validar duplicados
      if (await this.api.getUserByNickname(this.nickname)) {
        this.errorMessage.set('Nickname ya en uso.');
        return;
      }

      if (await this.api.getUserByEmail(this.email)) {
        this.errorMessage.set('Email ya en uso.');
        return;
      }

      const user: any = {
        Name: this.name,
        Surname1: this.surname1,
        Nickname: this.nickname,
        Email: this.email,
        Password: this.password
      };

      if (this.surname2) user.Surname2 = this.surname2;
      if (this.avatarPath) user.AvatarPath = this.avatarPath;

      const result = await this.api.post<AddUserDto>('users', user);

      if (result.success) {
        this.router.navigate(['/login']);
      } else {
        this.errorMessage.set(result.error || 'Error al registrar usuario');
      }

    } catch (err) {
      this.errorMessage.set('Error de conexión con el servidor.')
    }
  }
}