import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/layout/header';
import { Footer } from './shared/layout/footer';
import { routeFade } from './core/motion/route-animations';

@Component({
  selector: 'sanctum-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [routeFade],
})
export class App {
  /** Returns a stable identifier per route so the `routeFade` trigger fires on navigation. */
  protected prepareRoute(outlet: RouterOutlet): string {
    return outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('/') || 'home' : '';
  }
}
