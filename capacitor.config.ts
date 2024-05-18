import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pp4.app',
  appName: 'PPS-PP-App4',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      launchShowDuration: 1000,
      splashFullScreen: false
    }
  }
};

export default config;
