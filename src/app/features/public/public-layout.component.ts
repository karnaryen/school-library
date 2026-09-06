import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { T } from '../../shared/nl';

/** Header, footer and page background shared by every public page (landing, rondleiding, over, privacy). */
@Component({
  selector: 'app-public-layout',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-canvas text-ink">
      <header class="sticky top-0 z-20 bg-canvas/90 backdrop-blur border-b border-slate-200/70">
        <div class="page-width h-16 flex items-center gap-2">
          <a routerLink="/" class="flex items-center gap-2 no-underline text-ink mr-4" (click)="close()">
            <img src="/assets/images/logo4.png" alt="" class="h-10 w-10 rounded-xl">
            <span class="text-lg font-semibold">{{ t.appName }}</span>
          </a>
          <nav class="hidden md:flex items-center gap-1">
            @for (link of links; track link.path) {
              <a [routerLink]="link.path" routerLinkActive="active" class="public-link">{{ link.label }}</a>
            }
          </nav>
          <span class="grow"></span>
          <div class="hidden md:flex items-center gap-2">
            @if (signedIn()) {
              <a routerLink="/app" class="btn-primary text-base! py-2!">{{ t.publicNav.toApp }}</a>
            } @else {
              <a routerLink="/login" class="public-link">{{ t.nav.login }}</a>
              <a routerLink="/registreren" class="btn-primary text-base! py-2!">{{ t.nav.register }}</a>
            }
          </div>
          <button
            type="button"
            class="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 bg-white text-ink cursor-pointer"
            [attr.aria-label]="menuOpen() ? t.publicNav.closeMenu : t.publicNav.openMenu"
            [attr.aria-expanded]="menuOpen()"
            (click)="toggle()"
          >
            <mat-icon>{{ menuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
        @if (menuOpen()) {
          <nav class="md:hidden page-width pb-4 flex flex-col gap-1 border-t border-slate-200/70 pt-3">
            @for (link of links; track link.path) {
              <a [routerLink]="link.path" routerLinkActive="active" class="public-link py-3" (click)="close()">{{ link.label }}</a>
            }
            <div class="flex flex-wrap gap-2 mt-2">
              @if (signedIn()) {
                <a routerLink="/app" class="btn-primary grow" (click)="close()">{{ t.publicNav.toApp }}</a>
              } @else {
                <a routerLink="/login" class="btn-secondary grow" (click)="close()">{{ t.nav.login }}</a>
                <a routerLink="/registreren" class="btn-primary grow" (click)="close()">{{ t.nav.register }}</a>
              }
            </div>
          </nav>
        }
      </header>

      <main class="grow">
        <ng-content />
      </main>

      <footer class="border-t border-slate-200 bg-white">
        <div class="page-width py-8 flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-500">
          <span class="flex items-center gap-2">
            <img src="/assets/images/logo4.png" alt="" class="h-6 w-6 rounded-md">
            © {{ year }} {{ t.appName }}
          </span>
          <span class="sm:grow"></span>
          <nav class="flex flex-wrap gap-x-5 gap-y-2">
            @for (link of links; track link.path) {
              <a [routerLink]="link.path" class="text-slate-500 hover:text-brand">{{ link.label }}</a>
            }
            <a routerLink="/privacy" class="text-slate-500 hover:text-brand">{{ t.publicNav.privacy }}</a>
            <a href="mailto:info@biebouders.nl" class="text-slate-500 hover:text-brand">{{ t.publicNav.email }}</a>
          </nav>
        </div>
      </footer>
    </div>
  `,
})
export class PublicLayoutComponent {
  private readonly auth = inject(AuthService);
  protected readonly t = T;
  protected readonly year = new Date().getFullYear();
  protected readonly signedIn = computed(() => !!this.auth.user());
  protected readonly menuOpen = signal(false);
  protected readonly links = [
    { path: '/rondleiding', label: T.publicNav.tour },
    { path: '/over', label: T.publicNav.about },
  ];

  protected toggle(): void {
    this.menuOpen.update((open) => !open);
  }

  protected close(): void {
    this.menuOpen.set(false);
  }
}
