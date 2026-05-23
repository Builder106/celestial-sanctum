import { PLATFORM_ID, Injectable, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { createClient, type SanityClient } from '@sanity/client';
import { Observable, from, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { isSanityConfigured, sanityConfig } from './sanity.config';
import type { Homepage, Pastor, SiteSettings } from './sanity.types';

// TransferState lets the server's CMS fetch flow into the prerendered HTML so
// the browser doesn't re-fetch on hydration. Without this every CMS-driven
// page would re-pay the network round-trip after first paint.
const homepageKey = makeStateKey<Homepage>('sanity:homepage');
const pastorKey = makeStateKey<Pastor>('sanity:pastor');
const settingsKey = makeStateKey<SiteSettings>('sanity:siteSettings');

@Injectable({ providedIn: 'root' })
export class SanityService {
  private readonly transferState = inject(TransferState);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly client: SanityClient | null = isSanityConfigured()
    ? createClient({ ...sanityConfig })
    : null;

  // GROQ queries. Kept inline because they're small and only used here; if
  // they grow, move into a separate sanity.queries.ts.
  private readonly queries = {
    homepage: `*[_type == "csHomepage"][0]{
      heroEyebrow, heroLead, heroHeadline, heroSubcopy,
      missionEyebrow, missionQuote,
      sundayRhythm[]{ time, heading, body }
    }`,
    pastor: `*[_type == "csPastor"][0]{
      name, "portraitUrl": portrait.asset->url,
      letterPullQuote, letterBody, signature
    }`,
    settings: `*[_type == "csSiteSettings"][0]{
      parishName, parishAddress, parishPhone, parishEmail
    }`,
  };

  homepage(): Observable<Homepage | null> {
    return this.fetch(homepageKey, this.queries.homepage);
  }

  pastor(): Observable<Pastor | null> {
    return this.fetch(pastorKey, this.queries.pastor);
  }

  siteSettings(): Observable<SiteSettings | null> {
    return this.fetch(settingsKey, this.queries.settings);
  }

  private fetch<T>(key: ReturnType<typeof makeStateKey<T>>, query: string): Observable<T | null> {
    const cached = this.transferState.get<T | null>(key, null);
    if (cached !== null) {
      this.transferState.remove(key);
      return of(cached);
    }
    if (!this.client) return of(null);
    return from(this.client.fetch<T | null>(query)).pipe(
      tap((value) => {
        // Only the server writes — the browser already consumed the cache above.
        if (this.isServer) this.transferState.set(key, value);
      }),
      catchError(() => of(null)),
    );
  }
}
