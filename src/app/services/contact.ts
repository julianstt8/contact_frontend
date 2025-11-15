import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Contact, Telefono } from '../models/contact.model';
import { environment } from '../../environments/environment';
import { AppConfig } from './app-config';

// Interfaces para las respuestas del backend
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly API_URL = `${environment.apiUrl}contacts`;
  private readonly LS_KEY = 'contactos_db';

  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  public contacts$ = this.contactsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient, private config: AppConfig) {
    this.config.useBackend$.subscribe((useBackend) => {
      if (useBackend) {
        localStorage.removeItem(this.LS_KEY);
        this.loadAllContacts();
      } else {
        this.loadContactsFromJSON();
      }
    });

    // Cargar por primera vez
    if (this.config.getUseBackend()) {
      this.loadAllContacts();
    } else {
      this.loadContactsFromJSON();
    }
  }

  refreshContacts(): void {
    this.contactsSubject.next([]);
    if (!this.config.getUseBackend()) {
      const localData = localStorage.getItem(this.LS_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          this.contactsSubject.next(parsed);
        } else {
          this.loadContactsFromJSON();
        }
      } else {
        this.loadContactsFromJSON();
      }
    } else {
      this.loadAllContacts();
    }
  }

  private saveToLocalStorage(contacts: Contact[]): void {
    localStorage.setItem(this.LS_KEY, JSON.stringify(contacts));
  }

  loadContactsFromJSON(): void {
    this.http.get<Contact[]>('assets/contacts.json').subscribe({
      next: (contacts) => {
        this.updateLocalStateAndSave(contacts);
      },
      error: (err) => console.error('Error cargando JSON de contactos:', err),
    });
  }

  private updateLocalStateAndSave(contacts: Contact[]) {
    this.contactsSubject.next(contacts);
    this.saveToLocalStorage(contacts);
  }

  createContactLS(contact: Omit<Contact, 'id'>): Observable<Contact> {
    const newContact: Contact = {
      ...contact,
      id: new Date().getTime(), // generar id único local
    };
    const updatedContacts = [...this.contactsSubject.value, newContact];
    this.updateLocalStateAndSave(updatedContacts);
    return new BehaviorSubject(newContact).asObservable(); // simulamos HTTP
  }

  updateContactLS(id: number, contact: Contact): Observable<Contact> {
    const contacts = [...this.contactsSubject.value];
    const index = contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contact, id };
      this.updateLocalStateAndSave(contacts);
    }
    return new BehaviorSubject(contacts[index]).asObservable();
  }

  deleteContactLS(id: number): Observable<any> {
    const currentContacts = this.contactsSubject.value;
    const updatedContacts = currentContacts.filter((c) => c.id !== id);
    this.contactsSubject.next(updatedContacts);
    localStorage.setItem(this.LS_KEY, JSON.stringify(updatedContacts));
    return new BehaviorSubject({ success: true }).asObservable();
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    };
  }

  loadAllContacts(): void {
    this.loadingSubject.next(true);
    this.http
      .get<Contact[]>(this.API_URL)
      .pipe(
        tap((contacts) => console.log('Contactos:', contacts)),
        catchError(this.handleError)
      )
      .subscribe({
        next: (contacts) => {
          this.contactsSubject.next(contacts);
          this.loadingSubject.next(false);
        },
        error: (error) => {
          this.contactsSubject.next([]);
          this.loadingSubject.next(false);
        },
      });
  }
  getContacts(): Observable<Contact[]> {
    return this.contacts$;
  }

  getContactById(id: number): Observable<Contact> {
    if (!this.config.getUseBackend()) {
      const localContact = this.getContactByIdLocal(id);
      return new BehaviorSubject(localContact!).asObservable();
    }
    return this.http.get<Contact>(`${this.API_URL}/${id}`).pipe(
      tap((contact) => console.log('Contacto obtenido desde API:', contact)),
      catchError(this.handleError)
    );
  }

  createContact(contact: Omit<Contact, 'id'>): Observable<Contact> {
    if (!this.config.getUseBackend()) return this.createContactLS(contact);

    return this.http
      .post<Contact>(this.API_URL, contact, this.getHttpOptions())
      .pipe(tap(() => this.loadAllContacts()));
  }

  updateContact(id: number, contact: Contact): Observable<Contact> {
    if (!this.config.getUseBackend()) return this.updateContactLS(id, contact);

    return this.http
      .put<Contact>(`${this.API_URL}/${id}`, contact, this.getHttpOptions())
      .pipe(tap(() => this.loadAllContacts()));
  }

  deleteContact(id: number): Observable<any> {
    if (!this.config.getUseBackend()) return this.deleteContactLS(id);

    return this.http.delete(`${this.API_URL}/${id}`).pipe(tap(() => this.loadAllContacts()));
  }

  /**
   * Buscar contacto por ID en el estado local (síncrono)
   */
  getContactByIdLocal(id: number): Contact | undefined {
    return this.contactsSubject.value.find((contact) => contact.id === id);
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage =
            'No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté corriendo.';
          break;
        case 400:
          errorMessage = error.error?.error || 'Solicitud inválida. Verifica los datos enviados.';
          break;
        case 404:
          errorMessage = error.error?.error || 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = error.error?.error || `Error del servidor: ${error.status}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
