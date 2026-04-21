import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isLoggedIn: boolean = false;
  currentUser: any = null;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      this.isLoggedIn = isAuth;
    });

    // Subscribe to current user changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getAvatarUrl(): string {
    if (this.currentUser?.profile?.image) {
      return this.currentUser.profile.image;
    }
    return 'assets/default-avatar.png';
  }
}

