import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile?: {
    role: string;
    bio?: string;
    phone?: string;
    image?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_CONFIG.BASE_URL;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    if (!this.isBrowser) return; // <-- fix SSR
    if (localStorage.getItem('access_token')) {
      this.isAuthenticatedSubject.next(true);
      this.fetchCurrentUser();
    }
  }

  fetchCurrentUser(): void {
    this.http.get<User>(`${this.apiUrl}/user/me/`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        if (err.status === 401) {
          this.logout();
        }
      }
    });
  }

  register(data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, { username, password }).pipe(
      tap((response: any) => {
        if (this.isBrowser) { // <-- fix SSR
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
        }
        this.isAuthenticatedSubject.next(true);
        this.fetchCurrentUser();
      })
    );
  }

  logout(): void {
    if (this.isBrowser) { // <-- fix SSR
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false; // <-- fix SSR
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    if (!this.isBrowser) return null; // <-- fix SSR
    return localStorage.getItem('access_token');
  }
}