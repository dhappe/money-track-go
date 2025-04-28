
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2417fd023b7b464baf14c9b54adc651a',
  appName: 'MeuBolso',
  webDir: 'dist',
  server: {
    url: 'https://2417fd02-3b7b-464b-af14-c9b54adc651a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#F9FAFB",
    }
  }
};

export default config;
