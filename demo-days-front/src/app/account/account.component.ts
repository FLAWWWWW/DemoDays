import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})

export class AccountComponent implements OnInit {

  events: any[] = [];
  private apiURL = 'http://127.0.0.1:8000/api/events';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit():void {
    this.loadEventsFromDjango();
  }

  loadEventsFromDjango(){
    this.http.get<any[]>(this.apiURL + 'events').subscribe({
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

  onSubmitPresentation(){
    if(this.presentationForm.valid){
      const payload = this.presentationForm.value;
      console.log('Sending presentations,', payload);
    }
  }

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
