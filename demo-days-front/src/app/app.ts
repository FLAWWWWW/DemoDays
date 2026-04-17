import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgbModule, ReactiveFormsModule, CommonModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  email = new FormControl('', [Validators.required, Validators.email]);
  submitted = false;
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // Событие для кнопки Submit, выводит ошибку или показывает пользователю, что всё хорошо и имейл отправился
  onSubmit() {
    this.errorMessage = '';
    this.submitted = false;

    if (this.email.valid) {
      this.http.post('http://127.0.0.1:8000/api/subscribe/', {
        email: this.email.value
      }).subscribe({
        next: () => {
          this.submitted = true;
          this.email.reset();
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err.status === 400) {
            this.errorMessage = 'This email is already registered.';
            this.cdr.detectChanges();
          }
        }
      });
    }
  }
}