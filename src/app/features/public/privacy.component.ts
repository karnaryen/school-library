import { ChangeDetectionStrategy, Component } from '@angular/core';
import { T } from '../../shared/nl';
import { PublicLayoutComponent } from './public-layout.component';

@Component({
  selector: 'app-privacy',
  imports: [PublicLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-public-layout>
      <div class="public-section max-w-3xl! flex flex-col gap-4">
        <h1 class="section-title">{{ t.privacy.title }}</h1>
        @for (p of t.privacy.text; track p) {
          <p class="m-0 text-lg text-slate-700">{{ p }}</p>
        }
      </div>
    </app-public-layout>
  `,
})
export class PrivacyComponent {
  protected readonly t = T;
}
