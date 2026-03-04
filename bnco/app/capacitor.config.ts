import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'studio.bnco.app',
  appName: 'BNCO',
  webDir: 'dist',
  server: {
    url: 'https://bnco.studio',
    cleartext: false,
  },
  ios: {
    scheme: 'BNCO',
    contentInset: 'automatic',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#F5F0EB',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F5F0EB',
    },
  },
};

export default config;
