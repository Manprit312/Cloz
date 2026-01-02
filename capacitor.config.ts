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
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
