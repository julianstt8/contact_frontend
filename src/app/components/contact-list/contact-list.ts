import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact';
import { Contact } from '../../models/contact.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactCard } from '../../shared/contact-card/contact-card';
import { SharedImportsModule } from '../../shared/shared-imports-module';
import { MatDialog } from '@angular/material/dialog';
import { ContactForm } from '../contact-form/contact-form';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, tap } from 'rxjs';
import { AppConfig } from '../../services/app-config';

@Component({
  selector: 'app-contact-list',
  imports: [CommonModule, ReactiveFormsModule, SharedImportsModule, ContactCard],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit {
  contacts: Contact[] = [];
  isModalOpen = false;
  modalTitle = '';
  editingContactId?: number;
  api = 'http://localhost/contact-api/contacts';
  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private router: Router,
    private dialog: MatDialog,
    private config: AppConfig,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.config.useBackend$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.contactService.refreshContacts();
    this.contactService.getContacts().subscribe({
      next: (contacts) => (this.contacts = contacts),
      error: (e) => console.error(e),
    });
  }

  getAll() {
    this.http.get<Contact[]>(this.api).subscribe({
      next: (contacts) => (this.contacts = contacts),
      error: (error) => console.error('Error al cargar contactos:', error),
    });
  }

  editContact(id: any): void {
    this.openFormDialog(id);
  }

  addNewContact(): void {
    this.openFormDialog(null);
  }

  deleteContact(id: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      this.contactService.deleteContact(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
    }
  }

  openFormDialog(id: any) {
    const dialogRef = this.dialog.open(ContactForm, {
      width: '90%',
      data: {
        contactId: id,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.loadData();
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingContactId = undefined;
  }

  onFormSubmitted(): void {
    this.closeModal();
  }

  viewContact(id: any): void {
    this.router.navigate(['/contact', id]);
  }
}
