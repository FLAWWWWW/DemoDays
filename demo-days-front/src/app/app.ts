import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgbModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Используем inject для чистоты кода (актуально для Angular 21)
  private modalService = inject(NgbModal);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  isLoginMode: boolean = false;
  // Создаем группу полей для регистрации
  authForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    name: new FormControl(''),        // ← добавить
    surname: new FormControl('')      // ← добавить
    password_confirm: new FormControl('', [Validators.required]),
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    role: new FormControl('Guest', [Validators.required])
  });

  toggleMode(mode: boolean) {
    this.isLoginMode = mode;
    this.errorMessage = '';
    this.submitted = false;
    this.authForm.reset();

    const usernameControl = this.authForm.get('username');
    const nameControl = this.authForm.get('name');
    const surnameControl = this.authForm.get('surname');
    const confirmControl = this.authForm.get('confirmPassword');

    if (mode) { // Login mode
      usernameControl?.setValidators([Validators.required]);
      nameControl?.clearValidators();
      surnameControl?.clearValidators();
      confirmControl?.clearValidators();
    } else { // Register mode
      usernameControl?.setValidators([Validators.required]);
      nameControl?.setValidators([Validators.required]);
      surnameControl?.setValidators([Validators.required]);
      confirmControl?.setValidators([Validators.required]);
    }

    usernameControl?.updateValueAndValidity();
    nameControl?.updateValueAndValidity();
    surnameControl?.updateValueAndValidity();
    confirmControl?.updateValueAndValidity();
  }
  selectedRole: string = 'Guest';
  submitted = false;
  errorMessage = '';

  // Метод для открытия модалки (вызывается из хедера)
  openAuthModal(content: any) {
    this.submitted = false;
    this.errorMessage = '';
    this.authForm.reset();
    this.modalService.open(content, { centered: true, size: 'md' });
  }

  // Смена роли (Student / Organization / Guest)
  selectRole(role: string) {
    this.selectedRole = role;
  }

  onSubmit() {
    this.errorMessage = '';
    this.submitted = false;

    if (this.authForm.valid) {
      if (!this.isLoginMode) {
        // Register mode
        if (this.authForm.value.password !== this.authForm.value.confirmPassword) {
          this.errorMessage = 'Passwords do not match.';
          return;
        }

        const payload = {
          username: this.authForm.value.username,
          email: this.authForm.value.email,
          password: this.authForm.value.password,
          role: this.selectedRole
        };
  // Если это регистрация, отправляем все данные формы
    const payload = this.authForm.value;

        this.http.post('http://127.0.0.1:8000/api/register/', payload).subscribe({
          next: (response: any) => {
            this.submitted = true;
            this.authForm.reset();
            this.cdr.detectChanges();
            // Закрываем модалку автоматически через 2 секунды после успеха
            setTimeout(() => this.modalService.dismissAll(), 2000);
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Registration failed.';
            this.cdr.detectChanges();
          }
        });
      } else {
        // Login mode
        const payload = {
          username: this.authForm.value.username,
          password: this.authForm.value.password
        };

        this.http.post('http://127.0.0.1:8000/api/login/', payload).subscribe({
          next: (response: any) => {
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
            this.submitted = true;
            this.authForm.reset();
            this.cdr.detectChanges();
            // Закрываем модалку и обновляем статус
            setTimeout(() => {
              this.modalService.dismissAll();
              // Возможно, уведомить header об изменении статуса
            }, 2000);
          },
          error: (err) => {
            this.errorMessage = 'Invalid credentials.';
            this.cdr.detectChanges();
          }
        });
      }
    } else {
      this.errorMessage = 'Please fill out the form correctly.';
    }
    this.http.post('http://127.0.0.1:8000/api/register/', payload).subscribe({
      next: (res) => {
        this.submitted = true;
        this.authForm.reset({ role: 'Guest' }); // сбрасываем форму
        this.cdr.detectChanges();
        setTimeout(() => this.modalService.dismissAll(), 2000);
      },
      error: (err) => {
      // Выводим первую ошибку от бэкенда
        const errors = err.error;
        this.errorMessage = errors.email ? errors.email[0] : 
                            errors.password_confirm ? errors.password_confirm[0] : 
                            'Check your data and try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
