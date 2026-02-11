import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmanager.mobile',
  appName: 'Task Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      androidScaleType: 'CENTER_CROP',
    },
    Keyboard: {
      resize: 'body',
    },
    StatusBar: {
      overlaysWebView: false,
    },
  },
};

export default config;
