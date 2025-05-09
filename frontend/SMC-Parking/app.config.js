import 'dotenv/config';

export default {
  expo: {
    name: "SMC-Parking",
    slug: "SMC-Parking",
    version: '1.0.0',
    /*icon: './assets/icon.png',
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },*/
    updates: {
      "url": "https://u.expo.dev/2931a40f-abe3-460d-8ad4-f6b1bbad85ad"
    },
    runtimeVersion: {
      "policy": "appVersion"
    },
    android: {
      package: 'com.smc.parkingapp'
    },
    extra: {
      serverIp: process.env.SERVER_IP,
      eas: {
        projectId: '2931a40f-abe3-460d-8ad4-f6b1bbad85ad'
      }
    }
  }
};
