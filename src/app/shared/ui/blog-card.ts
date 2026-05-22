import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'sanctum-blog-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <article [class]="hostClass()">
      <a
        [href]="href()"
        [attr.target]="external() ? '_blank' : null"
        [attr.rel]="external() ? 'noopener noreferrer' : null"
        class="group block"
      >
        @if (imageUrl()) {
          <div [class]="imageWrapperClass()">
            <img
              [src]="imageUrl()"
              [alt]="title()"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        }
        <div class="px-1">
          <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-gold font-semibold mb-3">
            {{ date() }}
            @if (author()) {
              <span class="text-sanctum-muted/60 ml-2">· {{ author() }}</span>
            }
          </p>
          <h3 [class]="titleClass()">
            {{ title() }}
          </h3>
          @if (excerpt()) {
            <p class="font-body text-base text-sanctum-muted leading-relaxed line-clamp-3 mb-5">
              {{ excerpt() }}
            </p>
          }
          <span class="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-burgundy group-hover:text-sanctum-ink transition-colors">
            Read article
            <sanctum-icon [name]="external() ? 'arrow-up-right' : 'arrow-right'" [size]="14" />
          </span>
        </div>
      </a>
    </article>
  `,
  styles: `
    :host { display: block; }
  `,
})
export class BlogCard {
  readonly title = input.required<string>();
  readonly href = input.required<string>();
  readonly date = input<string>('');
  readonly author = input<string>('');
  readonly excerpt = input<string>('');
  readonly imageUrl = input<string | null>(null);
  readonly external = input<boolean>(true);
  readonly featured = input<boolean>(false);

  protected readonly hostClass = computed(() =>
    this.featured() ? 'featured' : 'standard',
  );

  protected readonly imageWrapperClass = computed(() => {
    const base =
      'relative w-full overflow-hidden rounded-sm bg-sanctum-rule mb-6';
    const aspect = this.featured() ? 'aspect-[16/9]' : 'aspect-[16/10]';
    return `${base} ${aspect}`;
  });

  protected readonly titleClass = computed(() => {
    const base =
      'font-display font-medium text-sanctum-ink leading-[1.15] tracking-[-0.01em] mb-4 transition-colors group-hover:text-sanctum-burgundy';
    const size = this.featured() ? 'text-3xl md:text-4xl' : 'text-2xl';
    return `${base} ${size}`;
  });
}
