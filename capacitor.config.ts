import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.celestialsanctumparish.app',
  appName: 'Celestial Sanctum',
  webDir: 'dist/celestial-sanctum/browser',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'apple.com'],
    },
  },
};

export default config;
