import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AddUserDto } from '../../models/add-user-dto';
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
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

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    document.body.classList.add('login-background');
  }

  ngOnDestroy() {
    document.body.classList.remove('login-background');
  }

  async submit() {
    // Validación básica de contraseñas
    this.errorMessage.set('');
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    // Validar duplicados
    if (await this.api.getUserByNickname(this.nickname)) {
      this.errorMessage.set('Ya existe un usuario con ese nickname.');
      return;
    }

    if (await this.api.getUserByEmail(this.email)) {
      this.errorMessage.set('Ese email ya está registrado.');
      return;
    }

    // Enviar propiedades con mayúscula inicial para .NET
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
      this.errorMessage.set('Error al registrar usuario: ' + result.error);
    }
  }
}
