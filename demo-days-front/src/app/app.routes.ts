import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventComponent } from './event/event.component';
import { AccountComponent } from './account/account.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'event/:id', component: EventComponent },
  { path: 'account', component: AccountComponent },
  { path: 'about', component: AboutComponent },
];
