import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppConfig {
  // true = usar backend, false = usar localStorage
  private useBackendSubject = new BehaviorSubject<boolean>(false);
  public useBackend$ = this.useBackendSubject.asObservable();

  setUseBackend(value: boolean): void {
    this.useBackendSubject.next(value);
  }

  getUseBackend(): boolean {
    return this.useBackendSubject.value;
  }
}
