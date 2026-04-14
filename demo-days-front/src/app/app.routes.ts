import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventComponent } from './event/event.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'event', component: EventComponent},
];
