import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { T } from '../../shared/nl';
import { PublicLayoutComponent } from './public-layout.component';

@Component({
  selector: 'app-about',
  imports: [RouterLink, MatIconModule, PublicLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
})
export class AboutComponent {
  protected readonly t = T;
}
