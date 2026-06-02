import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.celestialsanctumparish.app',
  appName: 'Celestial Sanctum',
  webDir: 'dist/celestial-sanctum/browser',
  plugins: {
    FirebaseAuthentication: {
      // true → the plugin only runs the native provider sheet (Google/Apple)
      // and returns the credential; AuthService links it into the Firebase JS
      // SDK via signInWithCredential — the SDK that drives user() /
      // onAuthStateChanged. With false the plugin ALSO signs into native
      // Firebase, which hung and left the JS user unset ("stuck on Signing in…").
      skipNativeAuth: true,
      providers: ['google.com', 'apple.com'],
    },
  },
};

export default config;
