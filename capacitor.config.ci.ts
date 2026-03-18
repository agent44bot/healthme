import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.fly.healthme',
  appName: 'HealthMe',
  webDir: 'www',
  server: {
    url: 'http://localhost:3000',
    allowNavigation: ['localhost']
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: true
  }
};

export default config;
