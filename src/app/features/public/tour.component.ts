import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { T } from '../../shared/nl';
import { PublicLayoutComponent } from './public-layout.component';

/** Rondleiding: one framed screenshot per app screen, with a short explanation. */
@Component({
  selector: 'app-tour',
  imports: [RouterLink, MatIconModule, PublicLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tour.component.html',
})
export class TourComponent {
  protected readonly t = T;
}
