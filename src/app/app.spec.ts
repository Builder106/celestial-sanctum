import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the parish shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the parish chrome on a normal route, not the bare /czm microsite', () => {
    // bareChrome() suppresses the parish header/footer only on BARE_ROUTES
    // (e.g. /czm). The default test URL is "/", so the chrome stays visible.
    const app = TestBed.createComponent(App).componentInstance as any;
    expect(app.bareChrome()).toBe(false);
  });

  it('emits no route-fade key until the router outlet activates', () => {
    // prepareRoute() feeds the @routeFade trigger; an inactive outlet must
    // yield an empty key so the transition doesn't fire on the first paint.
    const app = TestBed.createComponent(App).componentInstance as any;
    expect(app.prepareRoute({ isActivated: false })).toBe('');
  });
});
