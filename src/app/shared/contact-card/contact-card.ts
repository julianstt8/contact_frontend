import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Telefono } from '../../models/contact.model';
import { SharedImportsModule } from '../shared-imports-module';

export interface Contact {
  id: number | string;
  nombre: string;
  apellido: string;
  email: string;
  telefonos: Telefono[];
}

@Component({
  selector: 'app-contact-card',
  standalone: true,
  imports: [CommonModule, SharedImportsModule],
  templateUrl: './contact-card.html',
  styleUrl: './contact-card.scss',
})
export class ContactCard {
  @Input() contact: Contact = {
    id: 0,
    nombre: '',
    apellido: '',
    email: '',
    telefonos: [],
  };

  @Output() view = new EventEmitter<number | string>();
  @Output() edit = new EventEmitter<number | string>();
  @Output() delete = new EventEmitter<number | string>();

  onView() {
    this.view.emit(this.contact.id);
  }

  onEdit() {
    this.edit.emit(this.contact.id);
  }

  onDelete() {
    this.delete.emit(this.contact.id);
  }
}
