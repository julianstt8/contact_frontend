import { Routes } from '@angular/router';
import { ContactList } from './components/contact-list/contact-list';
import { ContactForm } from './components/contact-form/contact-form';
import { ContactDetail } from './components/contact-detail/contact-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/contacts', pathMatch: 'full' },
  { path: 'contacts', component: ContactList },
  { path: 'contact/:id', component: ContactDetail },
  { path: '**', redirectTo: '/contacts' },
];
