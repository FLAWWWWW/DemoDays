import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Home } from '../services/home';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgbModule, HttpClientModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  events: any[] = [];
  currentIndex = 0;  // ← добавить

  constructor(private homeService: Home, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.homeService.getEvents().subscribe({
      next: (data) => {
        this.events = [...data];
        this.currentIndex = 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка загрузки событий', err)
    });
  }

  // ← добавить эти три метода
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.events.length;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.events.length) % this.events.length;
  }

  goTo(index: number) {
    this.currentIndex = index;
  }
}