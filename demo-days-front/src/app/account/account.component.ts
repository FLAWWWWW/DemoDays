import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
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
