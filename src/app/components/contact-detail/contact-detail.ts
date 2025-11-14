import { Component, OnDestroy, OnInit } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contact';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedImportsModule } from '../../shared/shared-imports-module';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ContactForm } from '../contact-form/contact-form';

@Component({
  selector: 'app-contact-detail',
  imports: [CommonModule, ReactiveFormsModule, SharedImportsModule],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
})
export class ContactDetail implements OnInit, OnDestroy {
  contact?: Contact;
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = +params['id'];
      this.loadContact(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContact(id: number): void {
    this.loading = true;
    this.error = null;

    this.contactService
      .getContactById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contact) => {
          this.contact = contact;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Error al cargar el contacto';
          console.error('Error:', error);
          this.loading = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }

  editContact(): void {
    if (this.contact) {
      this.openFormDialog(this.contact.id);
    }
  }

  deleteContact(): void {
    if (this.contact && confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      this.loading = true;
      this.contactService
        .deleteContact(this.contact.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/contacts']);
          },
          error: (error) => {
            this.error = error.message || 'Error al eliminar el contacto';
            console.error('Error:', error);
            this.loading = false;
          },
        });
    }
  }

  openFormDialog(id: any) {
    const dialogRef = this.dialog.open(ContactForm, {
      width: '700px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'modal-contacto',
      data: {
        contactId: id,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (this.contact?.id) {
        this.loadContact(this.contact.id);
      }
    });
  }
}
