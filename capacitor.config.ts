import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.74df3e89fd8f42b680feb13fe7f7204c',
  appName: 'elin-learn-invest',
  webDir: 'dist',
  server: {
    url: 'https://74df3e89-fd8f-42b6-80fe-b13fe7f7204c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#0f1419',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f1419',
    },
    Haptics: {
      impact: 'medium'
    }
  }
};

export default config;