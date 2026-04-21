import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
  // Данные и состояние
  events: any[] = [];
  currentUser: any = null;
  selectedFile: File | null = null;
  isUploading: boolean = false;

  // API эндпоинты
  private readonly API_URLS = {
    events: 'http://127.0.0.1:8000/api/events',
    uploadAvatar: 'http://127.0.0.1:8000/api/upload-avatar/'
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // 1. Форма профиля пользователя
  profileForm = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl({ value: '', disabled: true }),
    bio: new FormControl(''),
    role: new FormControl('Guest')
  });

  // 2. Форма создания презентации (с динамическим списком участников)
  presentationForm = new FormGroup({
    eventId: new FormControl('', [Validators.required]),
    presentationName: new FormControl('', [Validators.required]),
    participantCount: new FormControl(1, [Validators.required, Validators.min(1)]),
    participants: new FormArray([])
  });

  // 3. Форма смены пароля
  passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  get participants() {
    return this.presentationForm.get('participants') as FormArray;
  }

  ngOnInit(): void {
    // Подписка на текущего пользователя для автозаполнения профиля
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.first_name || '',
          surname: user.last_name || '',
          email: user.email || ''
        });

        if (user.profile) {
          this.profileForm.patchValue({
            bio: user.profile.bio || '',
            phone: user.profile.phone || '',
            role: user.profile.role || 'Guest'
          });
        }
      }
    });

    // Загрузка доступных ивентов для селекта
    this.loadEventsFromDjango();

    // Инициализация первой строки участников
    this.syncParticipants(1);

    // Подписка на изменение числа участников для мгновенного создания полей
    this.presentationForm.get('participantCount')?.valueChanges.subscribe(value => {
      this.syncParticipants(value);
    });
  }

  // Создание группы полей для одного участника
  createParticipantGroup(): FormGroup {
    return new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
    });
  }

  // Мгновенная синхронизация FormArray с введенным числом
  syncParticipants(count: any) {
    const targetCount = Math.max(1, parseInt(count, 10) || 1);

    while (this.participants.length !== targetCount) {
      if (this.participants.length < targetCount) {
        this.participants.push(this.createParticipantGroup());
      } else {
        this.participants.removeAt(this.participants.length - 1);
      }
    }
    this.cdr.detectChanges(); // Гарантируем обновление DOM
  }

  loadEventsFromDjango(): void {
    this.http.get<any[]>(this.API_URLS.events).subscribe({
      next: (data) => {
        this.events = data;
        console.log('Events loaded:', this.events);
      },
      error: (error) => console.error('Error loading events', error)
    });
  }

  // Загрузка аватара
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadAvatar();
    }
  }

  uploadAvatar(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('avatar', this.selectedFile);

    this.http.post<{ avatar_url: string }>(this.API_URLS.uploadAvatar, formData).subscribe({
      next: (response) => {
        this.isUploading = false;
        if (this.currentUser) {
          if (!this.currentUser.profile) this.currentUser.profile = {};
          this.currentUser.profile.image = response.avatar_url;
          this.currentUser = { ...this.currentUser };
        }
        this.authService.fetchCurrentUser(); // Обновляем состояние в сервисе
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error:', error);
        alert('Failed to upload avatar.');
      }
    });
  }

  getAvatarUrl(): string {
    return this.currentUser?.profile?.image || 'assets/default-avatar.png';
  }

  // Отправка формы презентации в Django
  onSubmitPresentation(): void {
    if (this.presentationForm.valid) {
      const payload = this.presentationForm.getRawValue();
      console.log('Sending presentation data to backend:', payload);

      // Пример: this.http.post('...', payload).subscribe(...);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onDeleteAccount() {

    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');

    if (confirmed) {
      // 2. Отправляем запрос на бэкенд
      // Убедись, что в Django этот эндпоинт настроен (например, /api/delete-account/)
      this.http.delete('http://127.0.0.1:8000/api/delete-account/').subscribe({
        next: () => {
          alert('Your account has been successfully deleted.');
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Could not delete account. Please try again later.');
        }
      });
    }
  }

}
