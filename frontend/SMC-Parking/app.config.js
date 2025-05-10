import 'dotenv/config';

export default {
  expo: {
    name: "SMC-Parking",
    slug: "SMC-Parking",
    version: '1.0.0',
    main: "./app/App.tsx",
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    updates: {
      "url": "https://u.expo.dev/2931a40f-abe3-460d-8ad4-f6b1bbad85ad"
    },
    plugins: ["expo-notifications", "expo-task-manager", "expo-background-fetch"],
    runtimeVersion: {
      "policy": "appVersion"
    },
    android: {
      package: 'com.smc.parkingapp',
      permissions: ["RECEIVE_BOOT_COMPLETED", "WAKE_LOCK"],
    },
        ios: {
      bundleIdentifier: "com.smc.parkingapp",
      supportsTablet: true,
      backgroundModes: ["fetch", "remote-notification"],
    },
    extra: {
      serverIp: process.env.SERVER_IP,
      eas: {
        projectId: '2931a40f-abe3-460d-8ad4-f6b1bbad85ad'
      }
    }
  }
};
