import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cutconnect.app',
  appName: 'CutConnect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['cutconnect-backend-production.up.railway.app']
  },
  android: {
    backgroundColor: '#080808',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#080808',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
};

export default config;