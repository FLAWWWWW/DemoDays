import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Home } from '../services/home';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css'
})
export class EventComponent implements OnInit {
  event: any = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private homeService: Home,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loading = true;
      this.event = null;
      
      this.homeService.getEventById(id).subscribe({
        next: (data) => {
          this.event = { ...data };   
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Event not found';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }
}