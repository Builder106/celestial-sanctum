import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_NAME = 'Celestial Sanctum Parish';
const SITE_ORIGIN = 'https://celestial-sanctum.vercel.app';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-card.png`;

export interface SeoMeta {
  // Short page title; the service appends " — Celestial Sanctum" automatically
  // unless `bareTitle` is true.
  title: string;
  description: string;
  // Relative path the page lives at, e.g. "/about" or "/visit#service". Used to
  // build absolute canonical + og:url. Omit to default to the current path.
  path?: string;
  // Override the default 1200x630 OG card on a per-page basis (e.g. for a
  // future blog post route with its own image).
  imageUrl?: string;
  bareTitle?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(meta: SeoMeta): void {
    const title = meta.bareTitle ? meta.title : `${meta.title} — ${SITE_NAME}`;
    const url = `${SITE_ORIGIN}${meta.path ?? this.doc.location?.pathname ?? '/'}`;
    const image = meta.imageUrl ?? DEFAULT_OG_IMAGE;

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: meta.description });

    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: meta.description });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:image', content: image });

    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: meta.description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
