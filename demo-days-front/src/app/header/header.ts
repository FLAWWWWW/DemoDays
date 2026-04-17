import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isLoggedIn: boolean = false;

  ngOnInit(): void {
    this.checkLoginStatus();
  }
  checkLoginStatus(){
    this.isLoggedIn = !!localStorage.getItem('access_token');
  }

  logout(){
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isLoggedIn = false;
    // тута можно сделать редирект на главную
  }
}
