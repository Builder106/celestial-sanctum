# Mobile app — Celestial Sanctum (Capacitor + Firebase)

Native iOS + Android shells wrapping the existing Angular site, distributed via
the App Store and Play Store. Capacitor convention: one repo, web build feeds
`ios/` and `android/` native projects.

## What's scaffolded

- `capacitor.config.ts` — app name `Celestial Sanctum`, bundle ID
  `org.celestialsanctumparish.app`, `webDir` pointing at the Angular
  build output.
- `ios/` — Xcode project, ready to open with `npx cap open ios`. CocoaPods
  installed; pod install runs automatically on sync.
- `android/` — Gradle project. Will need Android Studio + SDK installed
  on whichever machine submits to the Play Store; current scaffold
  builds enough for the project tree but Gradle sync fails without the
  SDK (expected — non-blocker for iOS development).
- **Capacitor plugins**: `@capacitor/push-notifications`, `@capacitor/app`,
  `@capacitor/splash-screen`, `@capacitor/status-bar`,
  `@capacitor/browser` (in-app browser for the PayPal flow),
  `@capacitor/share` (native share sheet).
- **Firebase**: `firebase` JS SDK + `@capacitor-firebase/{authentication,
  firestore, messaging}` plugins. AngularFire was skipped — version 20
  pins Angular 20 and the project is on Angular 21; the JS SDK works
  fine with thin service wrappers (see `src/app/core/firebase/`).

## Firebase service skeletons (placeholder config)

Three services in `src/app/core/firebase/`:

- **`FirebaseService`** — singleton wrapper around the Firebase app
  instance. Lazy-initializes on first access; returns `null` when
  Firebase isn't configured yet so downstream services no-op
  gracefully.
- **`AuthService`** — Sign in with Apple + Sign in with Google. Routes
  through `@capacitor-firebase/authentication` so iOS gets the native
  Sign in with Apple sheet and Android gets the Google One-Tap account
  picker; web falls back to Firebase's hosted sign-in flows.
- **`MessagingService`** — FCM token registration + foreground
  notification listener. Native uses APNs/Android tokens via the
  plugin; web uses Firebase's service-worker token path (requires a
  VAPID key from the Firebase Console).

All three are no-ops when Firebase isn't configured, so the web build
keeps shipping without surprises until the parish webmaster
provisions the Firebase project.

## Parish webmaster — what to do

Three jobs, in order. The first two don't block scaffolding work but
do block actual mobile-app submission.

### 1. Apple Developer Program enrollment

- https://developer.apple.com/programs/enroll/
- Choose **Organization** if the parish has a DUNS number + IRS letter
  (typical 501(c)(3)); choose **Individual** for fastest setup ($99/yr
  either way). Apple verifies Organization status manually — can take
  a week.
- Once approved, send me the team ID + a developer account invite
  for the build pipeline; I'll generate the certificates and
  provisioning profiles needed for TestFlight.

### 2. Google Play Console enrollment

- https://play.google.com/console/signup
- $25 one-time fee. Faster review than Apple, usually same-day.
- Send me the account email so I can configure the upload key for
  CI builds.

### 3. Firebase project provisioning

- https://console.firebase.google.com/ → **Create project**.
- Project name: `Celestial Sanctum Parish` (or similar — only shown
  internally to admins).
- **Enable Google Analytics** when prompted — free, useful for
  membership and giving metrics later.
- **Add iOS app**: bundle ID `org.celestialsanctumparish.app`. Download
  `GoogleService-Info.plist` and send it to me; goes into `ios/App/App/`.
- **Add Android app**: package name `org.celestialsanctumparish.app`.
  Download `google-services.json` and send to me; goes into
  `android/app/`.
- **Add Web app**: register a web app (no hosting), copy the config
  object (apiKey, authDomain, projectId, etc.) and paste it into
  Vercel project env vars with the `NG_APP_FIREBASE_*` prefix.
- **Cloud Messaging → Web configuration**: generate a VAPID key pair,
  paste the public key into `NG_APP_FIREBASE_VAPID_KEY` env var.
- **Authentication → Sign-in method**: enable Google + Apple. Apple
  requires the Apple Developer team ID and a Sign in with Apple Service
  ID — Firebase walks through the setup.
- **APNs key**: in Firebase Console → Project Settings → Cloud
  Messaging tab, upload the APNs Authentication Key (.p8 file) from
  the Apple Developer Console. This is what lets FCM deliver pushes
  to iOS devices.

Once steps 1-3 are done and the config files / env vars are in place,
`isFirebaseConfigured()` will return true on the next deploy and
auth + push begin working.

## Local development workflow

```bash
# Web (no Capacitor needed — same as today)
npm start

# Mobile: build the web app, sync to native, open in IDE
npm run build
npx cap sync
npx cap open ios       # opens Xcode → simulator
npx cap open android   # opens Android Studio → emulator (needs Android SDK)
```

For rapid iteration without rebuilding the web bundle every change:
`npx cap run ios --livereload --external` serves the dev server over
your LAN and the simulator loads it directly. Same flag works for
Android.

## Architecture decisions worth remembering

- **Monorepo extension**, not separate repo. Web + ios + android in
  one git tree, one CI pipeline. Vercel ignores `ios/` and `android/`
  paths via "Ignored Build Step" so mobile-only commits don't trigger
  web deploys (TODO: wire this up in vercel.json when first mobile-
  only commits land).
- **Tab bar is conditional, not separate routes**. The same Angular
  routes serve web + mobile; the App component renders a native
  bottom tab bar wrapper when `Capacitor.isNativePlatform()` is true,
  preserving the parish header on web. (TODO: wire this up after
  Firebase config arrives — the tab bar wants a "Profile" tab that
  shows signed-in state.)
- **Auth foundation in v1, member features in v2**. AuthService is
  scaffolded and works today (modulo Firebase config). Prayer wall
  + member directory ship later; the auth surface exists now so v2
  doesn't have to retrofit.

## Status checklist

- [x] Capacitor scaffolded with parish bundle ID
- [x] iOS + Android native projects added
- [x] Capacitor plugins installed (push, app, splash, status-bar,
      browser, share)
- [x] Firebase + Capacitor Firebase plugins installed
- [x] FirebaseService + AuthService + MessagingService skeletons
- [ ] Parish webmaster: enroll in Apple Developer + Google Play
- [ ] Parish webmaster: provision Firebase project + share config
- [ ] Native tab-bar shell (lands after Firebase config arrives)
- [ ] Push registration backend (Firestore `pushTokens` collection +
      Sanity-publish-to-FCM trigger)
- [ ] App icon + splash screen generation from `public/img/cccIcon.svg`
- [ ] TestFlight beta build
- [ ] App Store + Play Store submission
