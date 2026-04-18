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
    password_confirm: new FormControl('', [Validators.required]),
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    role: new FormControl('Guest', [Validators.required])
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

  // Если это регистрация, отправляем все данные формы
    const payload = this.authForm.value;

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
