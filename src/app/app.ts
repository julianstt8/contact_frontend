import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConfig } from './services/app-config';
import { SharedImportsModule } from './shared/shared-imports-module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedImportsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'Gestor de Contactos';
  useBackend: boolean = false;

  constructor(private config: AppConfig) {
    this.useBackend = this.config.getUseBackend();
  }

  toggleBackend(): void {
    this.useBackend = !this.useBackend;
    this.config.setUseBackend(this.useBackend);
  }
}
