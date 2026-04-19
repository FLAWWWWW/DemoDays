import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';



@Component({
  selector: 'app-account',
  standalone: true,
  // ОБЯЗАТЕЛЬНО добавь эти два модуля в imports ниже
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
  constructor(private router: Router) {}
  profileForm = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl({value: '', disabled: true}), // Почту обычно менять нельзя без подтверждения
    bio: new FormControl(''),
    role: new FormControl('Guest')
  });

  onLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/']); // редирект на главную или страницу логина
  }

  passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
  });
}
