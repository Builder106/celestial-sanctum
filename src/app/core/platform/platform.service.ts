import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

/**
 * Single source of truth for "are we running inside a Capacitor native
 * shell, or in a normal web browser?"
 *
 * Capacitor exposes the same query statically via `Capacitor.isNativePlatform()`;
 * this service injects it so consumers can be tested with a fake without
 * mocking the static module. The native flag is fixed at load time —
 * no runtime transitions between native and web — so it's a plain
 * property, not a signal.
 *
 * Used by App + Header to swap the parish header/footer chrome for
 * a mobile tab bar shell on iOS/Android.
 */
@Injectable({ providedIn: 'root' })
export class PlatformService {
  /** True inside an iOS or Android Capacitor build, false in the browser. */
  readonly isNative = Capacitor.isNativePlatform();

  /** 'ios' | 'android' | 'web'. */
  readonly platform = Capacitor.getPlatform();
}
