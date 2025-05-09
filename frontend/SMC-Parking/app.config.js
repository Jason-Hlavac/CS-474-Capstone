import 'dotenv/config';

export default {
  expo: {
    name: "SMC-Parking",
    slug: "SMC-Parking",
    version: '1.0.0',
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
