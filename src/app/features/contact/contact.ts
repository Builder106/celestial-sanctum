import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SanctumButton } from '../../shared/ui/button';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon } from '../../shared/ui/icon';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { MapEmbed } from '../../shared/embeds/map-embed';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';

type FormState = 'idle' | 'sending' | 'sent' | 'error';
type Topic =
  | 'General'
  | 'First-Time Visit'
  | 'Prayer Request'
  | 'Volunteer'
  | 'Other';

@Component({
  selector: 'sanctum-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Display, Eyebrow, Icon, MapEmbed, SanctumButton, SanctumCascade, SanctumDrawIn, SanctumMark, SanctumReveal],
  template: `
    <!-- Page hero -->
    <section sanctumCascade stagger="spaced" class="pt-24 md:pt-32 pb-12 px-6 max-w-6xl mx-auto">
      <sanctum-eyebrow class="mb-6">Get in touch</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-8 max-w-4xl">
        <h1>
          Bring your
          <span class="italic text-sanctum-burgundy">questions.</span>
        </h1>
      </sanctum-display>
      <p class="font-body text-xl text-sanctum-muted leading-relaxed max-w-2xl">
        Reach the parish by phone, email, or the form below. Prayer requests
        and first-time-visitor questions are especially welcome.
      </p>
    </section>

    <div class="flex justify-center py-12 md:py-16">
      <sanctum-mark sanctumDrawIn [size]="56" />
    </div>

    <!-- Form + info side-by-side -->
    <section class="py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <!-- Form -->
        <div sanctumReveal class="lg:col-span-7">
          @if (state() === 'sent') {
            <div class="bg-sanctum-paper border-2 border-sanctum-gold rounded-sm p-10 md:p-12 text-center">
              <div class="flex justify-center mb-6">
                <sanctum-mark [size]="56" />
              </div>
              <sanctum-display size="md" class="mb-4">
                <h2>Message received.</h2>
              </sanctum-display>
              <p class="font-body text-base text-sanctum-muted leading-relaxed mb-8 max-w-md mx-auto">
                Thank you for reaching out. Someone from the parish will
                respond to <em class="not-italic text-sanctum-ink font-medium">{{ submittedEmail() }}</em>
                within two business days. If your need is urgent, please call us at 909.996.2397.
              </p>
              <button sanctumBtn type="button" variant="ghost" size="sm" (click)="reset()">
                Send another message
              </button>
            </div>
          } @else {
            <form
              class="bg-sanctum-paper border border-sanctum-rule rounded-sm p-8 md:p-10"
              (submit)="onSubmit($event)"
              novalidate
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label
                    for="contact-name"
                    class="block font-body text-xs uppercase tracking-[0.25em] text-sanctum-blue font-semibold mb-2"
                  >
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    [(ngModel)]="name"
                    class="w-full px-4 py-3 bg-sanctum-cream border border-sanctum-rule rounded-sm font-body text-base text-sanctum-ink placeholder:text-sanctum-muted/60 focus:outline-none focus:border-sanctum-gold transition-colors"
                    placeholder="Jane Adeyemi"
                  />
                </div>
                <div>
                  <label
                    for="contact-email"
                    class="block font-body text-xs uppercase tracking-[0.25em] text-sanctum-blue font-semibold mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    [(ngModel)]="email"
                    class="w-full px-4 py-3 bg-sanctum-cream border border-sanctum-rule rounded-sm font-body text-base text-sanctum-ink placeholder:text-sanctum-muted/60 focus:outline-none focus:border-sanctum-gold transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div class="mb-5">
                <label
                  for="contact-topic"
                  class="block font-body text-xs uppercase tracking-[0.25em] text-sanctum-blue font-semibold mb-2"
                >
                  Topic
                </label>
                <div class="relative">
                  <select
                    id="contact-topic"
                    name="topic"
                    [(ngModel)]="topic"
                    class="w-full appearance-none pl-4 pr-10 py-3 bg-sanctum-cream border border-sanctum-rule rounded-sm font-body text-base text-sanctum-ink focus:outline-none focus:border-sanctum-gold transition-colors"
                  >
                    @for (t of topics; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sanctum-muted">▾</span>
                </div>
              </div>

              <div class="mb-6">
                <label
                  for="contact-message"
                  class="block font-body text-xs uppercase tracking-[0.25em] text-sanctum-blue font-semibold mb-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="6"
                  required
                  [(ngModel)]="message"
                  class="w-full px-4 py-3 bg-sanctum-cream border border-sanctum-rule rounded-sm font-body text-base text-sanctum-ink placeholder:text-sanctum-muted/60 focus:outline-none focus:border-sanctum-gold transition-colors resize-y"
                  placeholder="Share your question, prayer request, or anything you'd like us to know."
                ></textarea>
              </div>

              <!-- Honeypot field, hidden from real users -->
              <div class="hidden" aria-hidden="true">
                <label>Don't fill this in <input type="text" name="website" [(ngModel)]="honeypot" tabindex="-1" autocomplete="off" /></label>
              </div>

              <button
                type="submit"
                [disabled]="state() === 'sending'"
                class="inline-flex items-center gap-2 px-9 py-4 bg-sanctum-burgundy text-sanctum-cream font-body text-sm font-medium tracking-[0.18em] uppercase hover:bg-sanctum-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (state() === 'sending') {
                  Sending…
                } @else {
                  Send Message
                  <sanctum-icon name="arrow-right" [size]="14" />
                }
              </button>

              @if (state() === 'error') {
                <p class="mt-4 font-body text-sm text-sanctum-burgundy">
                  Something went wrong sending your message. Please call the parish at 909.996.2397.
                </p>
              }
            </form>
          }
        </div>

        <!-- Contact info sidebar -->
        <aside sanctumReveal [delay]="150" class="lg:col-span-5">
          <div class="bg-sanctum-cream border border-sanctum-rule rounded-sm p-8 md:p-10">
            <sanctum-eyebrow class="mb-6">Direct contact</sanctum-eyebrow>

            <div class="space-y-7">
              <div>
                <p class="font-body text-xs uppercase tracking-[0.25em] text-sanctum-muted font-semibold mb-2">
                  Phone
                </p>
                <a
                  href="tel:909-996-2397"
                  class="font-display text-2xl text-sanctum-ink hover:text-sanctum-burgundy transition-colors inline-flex items-center gap-2"
                >
                  <sanctum-icon name="phone" [size]="18" />
                  909.996.2397
                </a>
              </div>
              <div>
                <p class="font-body text-xs uppercase tracking-[0.25em] text-sanctum-muted font-semibold mb-2">
                  Email
                </p>
                <a
                  href="mailto:celestialsanctumparish@gmail.com"
                  class="font-display text-lg md:text-xl text-sanctum-ink hover:text-sanctum-burgundy transition-colors inline-flex items-start gap-2 break-all"
                >
                  <span class="mt-1 shrink-0"><sanctum-icon name="mail" [size]="18" /></span>
                  celestialsanctumparish@gmail.com
                </a>
              </div>
              <div>
                <p class="font-body text-xs uppercase tracking-[0.25em] text-sanctum-muted font-semibold mb-2">
                  In person
                </p>
                <address class="not-italic font-display text-lg md:text-xl text-sanctum-ink leading-snug inline-flex items-start gap-2">
                  <span class="mt-1 shrink-0"><sanctum-icon name="map-pin" [size]="18" /></span>
                  <span>
                    11750 Cedar Avenue<br />
                    Bloomington, CA 92316
                  </span>
                </address>
              </div>
              <div>
                <p class="font-body text-xs uppercase tracking-[0.25em] text-sanctum-muted font-semibold mb-2">
                  Sunday worship
                </p>
                <p class="font-display text-lg md:text-xl text-sanctum-ink leading-snug">
                  10 AM – 2 PM
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Map -->
    <section sanctumReveal class="py-16 md:py-20 px-6 max-w-6xl mx-auto">
      <sanctum-map-embed
        query="11750 Cedar Avenue Bloomington CA 92316"
        title="Map to Celestial Sanctum Parish"
      />
    </section>

    <!-- Closing -->
    <section class="relative bg-sanctum-burgundy text-sanctum-cream overflow-hidden py-20 md:py-28 px-6 mt-12">
      <div
        class="absolute inset-0 opacity-10 pointer-events-none"
        aria-hidden="true"
        style='background-image: url("data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");'
      ></div>
      <div sanctumCascade stagger="default" class="relative max-w-3xl mx-auto text-center">
        <div class="flex justify-center mb-8">
          <sanctum-mark [size]="48" tone="light" />
        </div>
        <p class="font-display italic text-2xl md:text-3xl text-sanctum-cream leading-snug max-w-xl mx-auto">
          The doors are open. Bring your question, your grief, your thanksgiving.
        </p>
      </div>
    </section>
  `,
})
export class Contact {
  protected readonly topics: Topic[] = [
    'General',
    'First-Time Visit',
    'Prayer Request',
    'Volunteer',
    'Other',
  ];

  protected name = '';
  protected email = '';
  protected topic: Topic = 'General';
  protected message = '';
  protected honeypot = '';

  protected readonly state = signal<FormState>('idle');
  protected readonly submittedEmail = signal('');

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.honeypot) return; // silent drop for bots

    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) {
      this.state.set('error');
      return;
    }

    this.state.set('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          topic: this.topic,
          message: this.message,
          honeypot: this.honeypot,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.submittedEmail.set(this.email);
      this.state.set('sent');
    } catch {
      this.state.set('error');
    }
  }

  protected reset(): void {
    this.name = '';
    this.email = '';
    this.topic = 'General';
    this.message = '';
    this.honeypot = '';
    this.submittedEmail.set('');
    this.state.set('idle');
  }
}
