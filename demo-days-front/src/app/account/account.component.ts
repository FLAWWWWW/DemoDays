import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})

export class AccountComponent implements OnInit {

  events: any[] = [];
  currentUser: any = null;
  selectedFile: File | null = null;
  isUploading: boolean = false;
  private apiURL = 'http://127.0.0.1:8000/api/events';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit():void {
    // Fetch current user and events
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.first_name || '',
          surname: user.last_name || '',
          email: user.email || ''
        });
        // Fill role if available
        if (user.profile) {
          this.profileForm.patchValue({
            bio: user.profile.bio || '',
            phone: user.profile.phone || '',
            role: user.profile.role || 'Guest'
          });
        }
      }
    });

    this.loadEventsFromDjango();
  }

  loadEventsFromDjango(){
    this.http.get<any[]>(this.apiURL + '').subscribe({
      next: (data) =>{
        this.events = data;
        console.log('Events loaded', this.events);
      },
      error: (error) => console.error('Error loading events', error)
    });
  }

  profileForm = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl({value: '', disabled: true}),
    bio: new FormControl(''),
    role: new FormControl('Guest')
  });

  presentationForm = new FormGroup({
    eventId: new FormControl('', [Validators.required]),  // <-- добавь
    presentationName: new FormControl('', [Validators.required]),
    participantCount: new FormControl(1),
    participants: new FormArray([
      this.createParticipantGroup()
    ])
  });

  createParticipantGroup(): FormGroup {
    return new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
    })
  }

  get participants() {
    return this.presentationForm.get('participants') as FormArray;
  }

  addParticipant(){
    this.participants.push(this.createParticipantGroup());
  }

  removeParticipant(index: number){
    if (this.participants.length > 1){
      this.participants.removeAt(index);
    }
  }

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

    this.http.post<{avatar_url: string}>('http://127.0.0.1:8000/api/upload-avatar/', formData).subscribe({
      next: (response) => {
        this.isUploading = false;
        // Обновляем локально сразу, без ожидания HTTP запроса
        if (this.currentUser) {
          if (!this.currentUser.profile) {
            this.currentUser.profile = {};
          }
          this.currentUser.profile.image = response.avatar_url;
          this.currentUser = { ...this.currentUser }; // триггерим change detection
        }
        // Также обновляем в AuthService для хедера
        this.authService.fetchCurrentUser();
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error:', error);
        alert('Failed to upload avatar. Please try again.');
      }
    });
  }

  getAvatarUrl(): string {
    if (this.currentUser?.profile?.image) {
      return this.currentUser.profile.image;
    }
    return 'assets/default-avatar.png'; // или пустая иконка
  }

  onSubmitPresentation(){
    if(this.presentationForm.valid){
      const payload = this.presentationForm.value;
      console.log('Sending presentations,', payload);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']); // редирект на главную
  }

  passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
  });
}
