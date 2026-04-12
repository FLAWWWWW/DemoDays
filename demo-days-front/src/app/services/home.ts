import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Home {
  private apiUrl = 'http://127.0.0.1:8000/api/events/';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}