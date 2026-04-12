import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Home } from '../services/home';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgbModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  events: any[] = [];

  constructor(private homeService: Home) {}

  ngOnInit() {
    this.homeService.getEvents().subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error('Ошибка загрузки событий', err)
    });
  }
}