import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact';
import { Contact } from '../../models/contact.model';
import { CommonModule } from '@angular/common';
import { SharedImportsModule } from '../../shared/shared-imports-module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfig } from '../../services/app-config';

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule, ReactiveFormsModule, SharedImportsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm implements OnInit {
  contactForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private config: AppConfig,
    private dialogRef: MatDialogRef<ContactForm>,
    @Inject(MAT_DIALOG_DATA) public data: { contactId?: number }
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.data.contactId) {
      this.isEditMode = true;
      this.loadContact(this.data.contactId);
    }
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefonos: this.fb.array([this.createTelefonoGroup()]),
    });
  }

  loadContact(id: number): void {
    if (this.config.getUseBackend()) {
      this.contactService.getContactById(id).subscribe({
        next: (contact) => this.patchForm(contact),
        error: (err) => console.error('Error al cargar contacto desde backend:', err),
      });
    } else {
      const local = this.contactService.getContactByIdLocal(id);
      if (local) {
        this.patchForm(local);
      }
    }
  }

  patchForm(contact: Contact) {
    this.contactForm.patchValue({
      nombre: contact.nombre,
      apellido: contact.apellido,
      email: contact.email,
    });
    this.telefonos.clear();
    contact.telefonos.forEach((t) => this.telefonos.push(this.createTelefonoGroup(t)));
  }

  createTelefonoGroup(numero: any = ''): FormGroup {
    return this.fb.group({
      numero: [numero, [Validators.required, Validators.pattern(/^[+\d\s()-]+$/)]],
    });
  }

  addTelefono(): void {
    this.telefonos.push(this.createTelefonoGroup());
  }

  removeTelefono(index: number): void {
    if (this.telefonos.length > 1) {
      this.telefonos.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    const formData: Contact = {
      ...this.contactForm.value,
      telefonos: this.contactForm.value.telefonos.map((t: any) => t.numero),
    };
    if (this.isEditMode) {
      this.contactService.updateContact(this.data.contactId!, formData).subscribe({
        next: (updatedContact) => this.dialogRef.close(updatedContact),
        error: (err) => console.error('Error al actualizar contacto:', err),
      });
    } else {
      this.contactService.createContact(formData).subscribe({
        next: (newContact) => this.dialogRef.close(newContact),
        error: (err) => console.error('Error al crear contacto:', err),
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get telefonos(): FormArray {
    return this.contactForm.get('telefonos') as FormArray;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isTelefonoFieldInvalid(index: number): boolean {
    const field = this.telefonos.at(index).get('numero');
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
