import {
  PLATFORM_ID,
  Injectable,
  PendingTasks,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { createClient, type SanityClient } from '@sanity/client';
import { Observable, from, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { isSanityConfigured, sanityConfig } from './sanity.config';
import type {
  AboutSection,
  BlogPost,
  Homepage,
  Shepherd,
  SiteSettings,
  VisitPage,
} from './sanity.types';

// TransferState lets the server's CMS fetch flow into the prerendered HTML so
// the browser doesn't re-fetch on hydration. Without this every CMS-driven
// page would re-pay the network round-trip after first paint.
const homepageKey = makeStateKey<Homepage>('sanity:homepage');
const shepherdKey = makeStateKey<Shepherd>('sanity:shepherd');
const settingsKey = makeStateKey<SiteSettings>('sanity:siteSettings');
const aboutKey = makeStateKey<AboutSection[]>('sanity:aboutSections');
const visitKey = makeStateKey<VisitPage>('sanity:visitPage');
const blogKey = makeStateKey<BlogPost[]>('sanity:blogPosts');

@Injectable({ providedIn: 'root' })
export class SanityService {
  private readonly transferState = inject(TransferState);
  private readonly pendingTasks = inject(PendingTasks);
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
    shepherd: `*[_type == "csShepherd"][0]{
      name, "portraitUrl": portrait.asset->url,
      letterPullQuote, letterBody, signature
    }`,
    settings: `*[_type == "csSiteSettings"][0]{
      parishName, streetAddress, cityRegion,
      parishPhone, parishPhoneHref, parishEmail, mapsQuery
    }`,
    aboutSections: `*[_type == "csAboutSection"] | order(order asc){
      "anchorId": anchorId.current,
      label, eyebrow, heading, scripture,
      paragraphs, items[]{ term, definition }
    }`,
    visitPage: `*[_type == "csVisitPage"][0]{
      heroEyebrow, heroHeadline, heroHeadlineItalic, heroSubcopy,
      whenEyebrow, whenHeading, whenSubcopy,
      schedule[]{ day, detail, highlight },
      serviceEyebrow, serviceHeading, serviceHeadingItalic, serviceIntro,
      serviceElements[]{ term, definition },
      faqEyebrow, faqHeading,
      faqs[]{ q, a }
    }`,
    blogPosts: `*[_type == "csBlogPost"] | order(publishDate desc) [0...5]{
      title, href, displayDate, author, excerpt, imageUrl
    }`,
  };

  homepage(): Observable<Homepage | null> {
    return this.fetch(homepageKey, this.queries.homepage);
  }

  shepherd(): Observable<Shepherd | null> {
    return this.fetch(shepherdKey, this.queries.shepherd);
  }

  siteSettings(): Observable<SiteSettings | null> {
    return this.fetch(settingsKey, this.queries.settings);
  }

  aboutSections(): Observable<AboutSection[] | null> {
    return this.fetch(aboutKey, this.queries.aboutSections);
  }

  visitPage(): Observable<VisitPage | null> {
    return this.fetch(visitKey, this.queries.visitPage);
  }

  blogPosts(): Observable<BlogPost[] | null> {
    return this.fetch(blogKey, this.queries.blogPosts);
  }

  private fetch<T>(key: ReturnType<typeof makeStateKey<T>>, query: string): Observable<T | null> {
    const cached = this.transferState.get<T | null>(key, null);
    if (cached !== null) {
      this.transferState.remove(key);
      return of(cached);
    }
    if (!this.client) return of(null);
    // pendingTasks.add() blocks Angular SSR's "isStable" gate until we release
    // it. Without this, the @sanity/client Promise is invisible to SSR and the
    // page serializes before the fetch resolves. HttpClient calls don't need
    // this — Angular tracks them automatically.
    const releaseTask = this.pendingTasks.add();
    return from(this.client.fetch<T | null>(query)).pipe(
      tap((value) => {
        if (this.isServer) this.transferState.set(key, value);
      }),
      catchError(() => of(null)),
      finalize(() => releaseTask()),
    );
  }
}
