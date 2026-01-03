import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.cloz.app',
  appName: 'Cloz',
  webDir: 'www',
  server: {
    iosScheme: "https"
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None
    },
    CapacitorCookies: {
      enabled: true
    }
  },
  ios: {
    contentInset: "never",
  }
};

export default config;
