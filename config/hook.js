module.exports = {
  settings: {
    images: {
      enabled: true,
    },
    streamyard: {
      enabled: true,
      jwt: process.env.STREAMYARD_JWT,
      csrf: process.env.STREAMYARD_CSRF,
    },
    europeelects: {
      enabled: true,
    },
  },
};
