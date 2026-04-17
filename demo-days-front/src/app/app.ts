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
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  toggleMode(mode: boolean) {
    this.isLoginMode = mode;
    this.errorMessage = '';
    this.submitted = false;
    // Можно также сбрасывать форму при переключении
    this.authForm.reset();
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
      // Проверка совпадения паролей перед отправкой
      if (this.authForm.value.password !== this.authForm.value.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      const payload = {
        email: this.authForm.value.email,
        password: this.authForm.value.password,
        role: this.selectedRole
      };

      this.http.post('http://127.0.0.1:8000/api/subscribe/', payload).subscribe({
        next: () => {
          this.submitted = true;
          this.authForm.reset();
          this.cdr.detectChanges();

          // Закрываем модалку автоматически через 2 секунды после успеха
          setTimeout(() => this.modalService.dismissAll(), 2000);
        },
        error: (err) => {
          this.errorMessage = err.status === 400
            ? 'This email is already registered.'
            : 'Server error. Please try again later.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'Please fill out the form correctly.';
    }
  }
}
