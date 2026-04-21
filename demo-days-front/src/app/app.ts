import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
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
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isLoginMode: boolean = false;
  selectedRole: string = 'Guest';
  submitted = false;
  errorMessage = '';

  authForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password_confirm: new FormControl(''),
    first_name: new FormControl(''),
    last_name: new FormControl(''),
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

    if (!this.authForm.valid) {
      this.errorMessage = 'Please fill out email and password correctly.';
      this.cdr.detectChanges();
      return;
    }

    const val = this.authForm.value;

    if (!this.isLoginMode) {
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

      this.authService.register({
        username: val.username || '',
        email: val.email || '',
        password: val.password || '',
        password_confirm: val.password_confirm || '',
        first_name: val.first_name || '',
        last_name: val.last_name || '',
        role: val.role || 'Guest'
      }).subscribe({
        next: () => {
          this.authService.login(val.username || '', val.password || '').subscribe({
            next: () => this.handleSuccess('Registration successful! Welcome.'),
            error: (loginErr: any) => {
              console.error('Auto-login failed:', loginErr);
              this.handleSuccess('Registered! Please log in manually.');
            }
          });
        },
        error: (err: any) => {
          console.error('Server Error:', err);
          const errors = err.error;
          this.errorMessage =
            errors?.email?.[0] ||
            errors?.username?.[0] ||
            errors?.password?.[0] ||
            errors?.password_confirm?.[0] ||
            errors?.detail ||
            'Registration failed.';
          this.cdr.detectChanges();
        }
      });

    } else {
      this.authService.login(val.username || '', val.password || '').subscribe({
        next: () => this.handleSuccess('Login successful!'),
        error: (err: any) => {
          console.error('Login Error:', err);
          this.errorMessage = 'Invalid username or password.';
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
    setTimeout(() => this.modalService.dismissAll(), 2000);
  }
}