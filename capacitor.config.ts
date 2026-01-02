import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cloz.app',
  appName: 'Cloz',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: "none"
    }
  },
  server: {
    url: "https://api.cloz.pro",
    cleartext: false,
  },
  CapacitorCookies:{
    enabled:true
  },
  ios: {
    contentInset: "never",
  }
};

export default config;
