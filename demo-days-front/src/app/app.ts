import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgbModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private modalService = inject(NgbModal);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  isLoginMode: boolean = false;
  selectedRole: string = 'Guest';
  submitted = false;
  errorMessage = '';

  // Инициализация формы с минимальными обязательными полями
  authForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password_confirm: new FormControl(''), // Необязательно для валидности всей формы
    first_name: new FormControl(''),       // Необязательно
    last_name: new FormControl(''),        // Необязательно
    role: new FormControl('Guest')
  });

  toggleMode(mode: boolean) {
    this.isLoginMode = mode;
    this.errorMessage = '';
    this.submitted = false;
    this.authForm.reset({ role: 'Guest' });
    this.cdr.detectChanges();
  }

  openAuthModal(content: any) {
    this.submitted = false;
    this.errorMessage = '';
    this.authForm.reset({ role: 'Guest' });
    this.modalService.open(content, { centered: true });
  }

  selectRole(role: string) {
    this.selectedRole = role;
    this.authForm.patchValue({ role: role });
  }

  onSubmit() {
    console.log('--- SUBMIT PROCESS STARTED ---');
    this.errorMessage = '';
    this.submitted = false;

    // 1. Проверка базовой валидности (Email, Username, Password)
    if (!this.authForm.valid) {
      this.errorMessage = 'Please fill out email and password correctly.';
      this.cdr.detectChanges();
      return;
    }

    const val = this.authForm.value;

    if (!this.isLoginMode) {
      // --- ЛОГИКА РЕГИСТРАЦИИ ---

      // Ручная проверка полей регистрации (так как в FormGroup они необязательны)
      if (!val.first_name || !val.last_name || !val.password_confirm) {
        this.errorMessage = 'Please fill in Name, Surname and Password Confirmation.';
        this.cdr.detectChanges();
        return;
      }

      if (val.password !== val.password_confirm) {
        this.errorMessage = 'Passwords do not match.';
        this.cdr.detectChanges();
        return;
      }

      console.log('Sending Registration to Django:', val);

      this.http.post('http://127.0.0.1:8000/api/register/', val).subscribe({
        next: (res) => {
          this.handleSuccess('Registration successful! Welcome.');
        },
        error: (err) => {
          console.error('Server Error:', err);
          // Вытаскиваем ошибку от Django (например, если email занят)
          const errors = err.error;
          this.errorMessage = errors?.email ? errors.email[0] :
            errors?.username ? errors.username[0] :
              errors?.detail || 'Registration failed.';
          this.cdr.detectChanges();
        }
      });

    } else {
      // --- ЛОГИКА ЛОГИНА ---
      const loginPayload = {
        username: val.username, // или val.email, смотря как в Django настроено
        password: val.password
      };

      console.log('Sending Login to Django:', loginPayload);

      this.http.post('http://127.0.0.1:8000/api/login/', loginPayload).subscribe({
        next: (response: any) => {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          this.handleSuccess('Login successful! Redirecting...');
        },
        error: (err) => {
          console.error('Login Error:', err);
          this.errorMessage = 'Invalid email/username or password.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  private handleSuccess(message: string) {
    this.submitted = true;
    console.log(message);
    this.authForm.reset({ role: 'Guest' });
    this.cdr.detectChanges();
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }
}
